# FlowLab — ES 335 project website

Multiclass Network Attack Classification from Network Flow Features

Adusumilli Viraat Krishna (24110016) · Omer Mohammed Mubeenuddin (24110228)

## Run the website

Open `index.html` directly, or serve this folder with `python -m http.server 8000` and visit `http://localhost:8000`. No build, backend, API key, npm dependency, font CDN, or chart CDN is required. All asset paths are relative, including under a GitHub Pages repository subpath.

Files: `index.html`, `styles.css`, `app.js`, `browser-inference.js`, `data/`, `assets/`, `ML_Evaluation.ipynb` and this README. `data/models.js` bundles the trained model parameters for local browser inference. `results.js` contains the same validation data and example flows as `results.json` for local file viewing. `.nojekyll` supports static Pages delivery.

## GitHub Pages deployment

1. Copy the files listed above to your repository's `docs/` directory (or repository root). Keep the local dataset and checkpoints in the ignored `.local-ml/` directory.
2. Commit and push to the repository.
3. In GitHub Settings → Pages choose Deploy from a branch, `main`, and `/docs` (or `/` for root deployment).
4. Visit `https://axylex.github.io/Multi-Class-Network-attack-classification/` once GitHub confirms deployment. That URL is an expected address, not proof of deployment.

## Evidence and data contract

Repository: https://github.com/axylex/Multi-Class-Network-attack-classification

The Results explorer uses the audited local run of `ML_Evaluation.ipynb` on `cic-collection.parquet`. The dataset checksum and software versions are in `data/results.json` under `localRun`. The `audit` section records before-and-after class counts, identical columns, constant-feature checks, row removals and split sizes.

- Cell 9: dataset class counts. Cell 14: splits; cell 16: training subsample.
- Cells 14 and 16 audit exact duplicates before the split and fit a constant-feature filter on the training sample. The audit removed 4 identical feature columns, 310 redundant same-label rows and 14 rows from 7 conflicting-label groups. It found zero constant features in the dataset and training sample. The models used 53 predictors and the audited validation set contains 1,375,089 flows.
- Cells 20, 23 and 27 define the five fitted models. The validation confusion-matrix section saves all six validation matrices, including the baseline that predicts the most common training class. Accuracy, macro-F1 and per-class scores come from the same predictions as the matrices.
- Cells 29 and 31 generate the audited XGBoost test ROC and precision–recall figures.
- The held-out test section evaluates SGD, Random Forest, histogram gradient boosting, MLP and the majority baseline on the same 1,375,089 test flows. It saves classification reports and one-vs-rest ROC and precision–recall plots. SGD uses class decision scores because its probability normalization underflows on some test flows. The website includes the reports and the downloadable `data/test-results.json` with per-class ROC-AUC and average precision.

Each model object has `id`, `name`, `accuracy`, `macroF1`, `perClass` (precision, recall, F1 in the shared class order), `matrix` (true rows, predicted columns), and `matrixSource`. For future reruns, export `confusion_matrix(y_val, y_pred, labels=range(8)).tolist()` along with the scores computed from the same `y_pred`.

## Reproduce the ML analysis

1. Obtain CIC-IDS-Collection from https://www.kaggle.com/dsv/4477547 under its access/license terms. Record exact release, URL, checksum and which constituent datasets are present. The catalog includes four datasets; the notebook's local filename alone does not verify its contents.
2. Install Python with pandas, NumPy, PyArrow, scikit-learn, XGBoost, Matplotlib and seaborn. See `localRun.versions` in `data/results.json` for the validation rerun environment.
3. Open the notebook from the project folder and set `dataset_path` to the extracted parquet file. Run the audit and split cells before fitting the models. The notebook saves the audited checkpoints in `.local-ml/audited/`.
4. The audit keeps one row per exact feature vector with a single label and excludes every row in conflicting-label groups. It compares the original numeric values and preserves feature precision through the split.
5. Seed 42 gives a 70/15/15 stratified split followed by a 20% stratified training sample. The training sample determines the constant-feature mask, which is applied to all three splits.
6. Run the validation matrix cell to export validation metrics and the audit to `.local-ml/audited/validation-results.json`. Run the held-out test cell to export the test reports and ranking metrics to `.local-ml/audited/test-results.json`.

## Interactions and limitations

The model selector updates metrics, per-class precision/recall/F1, and confusion matrices. Matrix cells support hover, click and keyboard focus. The row percentage toggle switches between row-normalized percentages and counts with a logarithmic color scale. The class distribution switches between logarithmic and linear scales.

The flow inspector runs any of the five trained models directly in the browser. The eight example flows were selected with seed 42 in test checkpoint order before inspecting the predictions. Clicking Predict runs inference with all 53 predictors and measures how long the model call takes. The inspector displays five selected measurements, the predicted class and its uncalibrated score. For SGD, the scores use log-space normalization of the one-vs-rest sigmoid scores to avoid numerical underflow.

To regenerate the browser parameters after running the audited notebook, call the exporter from the project directory.

```python
from scripts.export_browser_models import export_browser_models

export_browser_models({
    "sgd": baseline_pipeline,
    "rf": rf_model,
    "hgb": gb_model,
    "xgb": xgb_model,
    "mlp": mlp_pipeline,
}, X_test, y_test)
```

## AI-use disclosure

AI assisted website code, design, methodological review, the flow inspector, and local model evaluation. `[TEAM TO COMPLETE: original analysis AI tools, tasks assisted, and verification performed.]`

## Privacy

The site includes aggregate metrics, notebook figures, model parameters and features from eight public benchmark flows. Inference runs locally in the browser. Third-party repository and reference links are user-initiated navigation.

## Submission checklist

- [x] Seven rubric sections, team/course metadata and explicit scope.
- [x] Class imbalance, cleaning, label leakage, split and scaler reasoning.
- [x] Baselines, five trained-model reports, and methodological limitations.
- [x] Two interactive modules with honest evidence/simulation labels.
- [x] Relative static paths, responsive layout, keyboard-accessible controls.
- [x] Code/data links, references, AI disclosure and privacy section.
- [ ] Team review of AI-use disclosure and experimental claims.
- [ ] Match the original notebook's dataset release to the audited parquet checksum.
- [x] Duplicate and constant-feature audit with the original numeric precision.
- [x] Exact validation confusion matrices for all five trained models and the majority baseline.
- [x] Held-out test classification reports and curves for the four trained models other than XGBoost, with the majority baseline as a reference. XGBoost test curves are included with its existing notebook figures.
- [ ] Confidence intervals or repeated-seed results; host/time-disjoint evaluation.
- [ ] Verify your GitHub Pages publication after copying files into the repository.

Formal dataset, library and paper references are included in the website's References section. No external website template or third-party JavaScript library was used.
