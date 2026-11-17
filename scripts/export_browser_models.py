"""Export fitted notebook classifiers and eight held-out flows for offline inference."""

import json
from pathlib import Path

import numpy as np


def serialize_linear(model):
    scaler = model.named_steps["scaler"]
    classifier = model.named_steps["logreg"]
    if classifier.loss != "log_loss":
        raise ValueError("The browser uses sigmoid scores for the SGD logistic classifier.")
    return {
        "center": scaler.center_.tolist(),
        "scale": scaler.scale_.tolist(),
        "weights": classifier.coef_.T.tolist(),
        "bias": classifier.intercept_.tolist(),
    }


def serialize_mlp(model):
    scaler = model.named_steps["scaler"]
    classifier = model.named_steps["mlp"]
    if classifier.activation != "relu" or classifier.out_activation_ != "softmax":
        raise ValueError("The browser expects ReLU hidden layers and multiclass softmax output.")
    layers = [
        [weights.tolist(), biases.tolist()]
        for weights, biases in zip(classifier.coefs_, classifier.intercepts_, strict=True)
    ]
    return {
        "center": scaler.center_.tolist(),
        "scale": scaler.scale_.tolist(),
        "hidden": layers[:-1],
        "output": layers[-1],
    }


def serialize_forest(model):
    trees = []
    for estimator in model.estimators_:
        tree = estimator.tree_
        trees.append([
            [-1, tree.value[node, 0].tolist()] if left == -1 else [feature, split, left, right]
            for node, (feature, split, left, right) in enumerate(zip(
                tree.feature.tolist(), tree.threshold.tolist(),
                tree.children_left.tolist(), tree.children_right.tolist(), strict=True,
            ))
        ])
    return {"trees": trees, "classCount": len(model.classes_)}


def serialize_histogram(model):
    trees = []
    for iteration in model._predictors:
        for label, predictor in enumerate(iteration):
            nodes = predictor.nodes
            if nodes["is_categorical"].any():
                raise ValueError("The browser exporter expects numeric histogram splits.")
            trees.append([label, [
                [-1, float(node["value"])] if node["is_leaf"] else [
                    int(node["feature_idx"]), float(node["num_threshold"]),
                    int(node["left"]), int(node["right"]),
                ]
                for node in nodes
            ]])
    return {"base": model._baseline_prediction.ravel().tolist(), "trees": trees}


def serialize_xgboost(model):
    learner = json.loads(model.get_booster().save_raw(raw_format="json"))["learner"]
    booster = learner["gradient_booster"]
    if booster["name"] != "gbtree" or learner["objective"]["name"] != "multi:softprob":
        raise ValueError("The browser expects a multiclass XGBoost tree ensemble.")
    base = json.loads(learner["learner_model_param"]["base_score"])
    if isinstance(base, (int, float)):
        base = [base] * len(model.classes_)

    trees = []
    for label, tree in zip(booster["model"]["tree_info"], booster["model"]["trees"], strict=True):
        if any(tree["split_type"]):
            raise ValueError("The browser exporter expects numeric XGBoost splits.")
        conditions = np.asarray(tree["split_conditions"], dtype=np.float32).tolist()
        trees.append([label, [
            [-1, split] if left == -1 else [feature, split, left, right]
            for feature, split, left, right in zip(
                tree["split_indices"], conditions, tree["left_children"], tree["right_children"],
                strict=True,
            )
        ]])
    return {"base": np.asarray(base, dtype=np.float32).tolist(), "trees": trees}


def select_flows(y_test, count):
    rng = np.random.default_rng(42)
    return [int(rng.choice(np.flatnonzero(np.asarray(y_test) == label))) for label in range(count)]


def export_browser_models(models, X_test, y_test, data_dir="data"):
    """Use the same feature and class order as the audited notebook results."""
    serializers = {
        "sgd": serialize_linear, "rf": serialize_forest, "hgb": serialize_histogram,
        "xgb": serialize_xgboost, "mlp": serialize_mlp,
    }
    if set(models) != set(serializers):
        raise ValueError("Supply the five trained notebook models by ID.")

    folder = Path(data_dir)
    results_path = folder / "results.json"
    results = json.loads(results_path.read_bytes())
    class_ids = np.arange(len(results["classes"]))
    features = results["audit"]["modelFeatures"]
    if list(X_test.columns) != features or len(X_test) != len(y_test):
        raise ValueError("Use the audited test checkpoint and its model feature order.")
    if len(X_test) != results["audit"]["testFlows"]:
        raise ValueError("The test set size differs from the audited run.")

    bundle = {}
    for model_id, serialize in serializers.items():
        model = models[model_id]
        if list(model.feature_names_in_) != features or not np.array_equal(model.classes_, class_ids):
            raise ValueError(f"{model_id} does not match the audited feature and class order.")
        bundle[model_id] = {"type": model_id, "featureCount": len(features), **serialize(model)}

    fields = results["flowInspector"]["fields"]
    indices = select_flows(y_test, len(class_ids))
    examples = []
    for label, index in enumerate(indices):
        row = X_test.iloc[index]
        vector = row.to_numpy(dtype=float)
        if not np.isfinite(vector).all():
            raise ValueError("The browser requires finite inputs.")
        examples.append({"label": label, "values": row[fields].tolist(), "features": vector.tolist()})
    results["flowInspector"] = {"fields": fields, "examples": examples}

    weights = json.dumps(bundle, separators=(",", ":"), allow_nan=False)
    serialized = json.dumps(results, ensure_ascii=True, indent=2, allow_nan=False)
    (folder / "models.js").write_text(
        "// Generated by scripts/export_browser_models.py.\n"
        f"window.BROWSER_MODELS = {weights};\n", encoding="utf-8",
    )
    results_path.write_text(serialized + "\n", encoding="utf-8")
    (folder / "results.js").write_text(
        "// Generated from results.json; keeps the website usable when opened as a local file.\n"
        f"window.RESULTS = {serialized};\n", encoding="utf-8",
    )
