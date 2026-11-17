'use strict';

(() => {
  function argmax(values) {
    let best = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[best]) best = i;
    }
    return best;
  }

  function softmax(values) {
    const max = Math.max(...values);
    const weights = values.map(value => Math.exp(value - max));
    const sum = weights.reduce((total, weight) => total + weight, 0);
    return weights.map(weight => weight / sum);
  }

  function scale(features, {center, scale}) {
    return features.map((value, index) => (value - center[index]) / scale[index]);
  }

  function affine(input, weights, biases) {
    return biases.map((bias, neuron) => {
      let value = 0;
      for (let i = 0; i < input.length; i++) value += input[i] * weights[i][neuron];
      return value + bias;
    });
  }

  function logSigmoid(value) {
    return value >= 0 ? -Math.log1p(Math.exp(-value)) : value - Math.log1p(Math.exp(value));
  }

  function leaf(tree, features, strictSplit = false) {
    let node = tree[0];
    while (node[0] >= 0) {
      const [feature, threshold, left, right] = node;
      const value = features[feature];
      const goLeft = strictSplit ? value < threshold : value <= threshold;
      node = tree[goLeft ? left : right];
    }
    return node[1];
  }

  function forest(model, features) {
    const rounded = features.map(Math.fround);
    const totals = Array(model.classCount).fill(0);
    for (const tree of model.trees) {
      const scores = leaf(tree, rounded);
      scores.forEach((score, index) => { totals[index] += score; });
    }
    return totals.map(total => total / model.trees.length);
  }

  function boostedScores(model, features) {
    const xgboost = model.type === 'xgb';
    const input = xgboost ? features.map(Math.fround) : features;
    const margins = model.base.slice();
    for (const [label, tree] of model.trees) {
      const value = margins[label] + leaf(tree, input, xgboost);
      margins[label] = xgboost ? Math.fround(value) : value;
    }
    return softmax(margins);
  }

  window.predictBrowserModel = (modelId, features) => {
    const model = window.BROWSER_MODELS[modelId];
    if (!model || features.length !== model.featureCount || !features.every(Number.isFinite)) {
      throw new Error('The flow must contain all finite features expected by the selected model.');
    }

    let scores;
    switch (model.type) {
      case 'sgd': {
        const margins = affine(scale(features, model), model.weights, model.bias);
        return {label: argmax(margins), scores: softmax(margins.map(logSigmoid))};
      }
      case 'mlp': {
        let input = scale(features, model);
        for (const [weights, biases] of model.hidden) {
          input = affine(input, weights, biases).map(value => Math.max(value, 0));
        }
        scores = softmax(affine(input, ...model.output));
        break;
      }
      case 'rf':
        scores = forest(model, features);
        break;
      case 'hgb':
      case 'xgb':
        scores = boostedScores(model, features);
        break;
      default:
        throw new Error('Unknown model type.');
    }
    return {label: argmax(scores), scores};
  };
})();
