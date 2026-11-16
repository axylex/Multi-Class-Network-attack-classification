// Generated from results.json; keeps the website usable when opened as a local file.
window.RESULTS = {
  "source": "https://github.com/axylex/Multi-Class-Network-attack-classification",
  "commit": "b8401c1cbdad95366c2d76509542c526c0535d98",
  "split": "validation",
  "classes": [
    "Benign",
    "Botnet",
    "Bruteforce",
    "DDoS",
    "DoS",
    "Infiltration",
    "Portscan",
    "Webattack"
  ],
  "support": [
    1077928,
    21895,
    15486,
    185209,
    59601,
    14229,
    339,
    450
  ],
  "counts": [
    7186189,
    145968,
    103244,
    1234729,
    397344,
    94857,
    2255,
    2995
  ],
  "models": [
    {
      "id": "majority",
      "name": "Majority baseline \u00b7 always Benign",
      "accuracy": 0.783869534453658,
      "macroF1": 0.10985522193663845,
      "perClass": [
        [
          0.783869534453658,
          1,
          0.8788417754931076
        ],
        [
          0,
          0,
          0
        ],
        [
          0,
          0,
          0
        ],
        [
          0,
          0,
          0
        ],
        [
          0,
          0,
          0
        ],
        [
          0,
          0,
          0
        ],
        [
          0,
          0,
          0
        ],
        [
          0,
          0,
          0
        ]
      ],
      "matrix": [
        [
          1077928,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          21895,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          15486,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          185209,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          59601,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          14229,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          339,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          450,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ]
      ],
      "matrixSource": "Analytically computed from validation support; always predicts Benign. Undefined precision is displayed as zero."
    },
    {
      "id": "sgd",
      "name": "Linear baseline \u00b7 SGD",
      "accuracy": 0.1819,
      "macroF1": 0.0653,
      "perClass": [
        [
          0.85,
          0.2,
          0.33
        ],
        [
          0.0,
          0.0,
          0.0
        ],
        [
          0.0,
          0.0,
          0.0
        ],
        [
          0.58,
          0.02,
          0.03
        ],
        [
          0.09,
          0.45,
          0.15
        ],
        [
          0.0,
          0.01,
          0.01
        ],
        [
          0.0,
          0.06,
          0.0
        ],
        [
          0.0,
          0.66,
          0.0
        ]
      ],
      "matrix": null,
      "matrixSource": "Not exported in the source notebook. Rounded per-class reports cannot recover an exact confusion matrix."
    },
    {
      "id": "rf",
      "name": "Random Forest",
      "accuracy": 0.7721,
      "macroF1": 0.7154,
      "perClass": [
        [
          1.0,
          0.71,
          0.83
        ],
        [
          0.96,
          1.0,
          0.98
        ],
        [
          1.0,
          1.0,
          1.0
        ],
        [
          0.98,
          1.0,
          0.99
        ],
        [
          0.96,
          1.0,
          0.98
        ],
        [
          0.04,
          0.88,
          0.08
        ],
        [
          0.66,
          0.9,
          0.76
        ],
        [
          0.06,
          0.9,
          0.11
        ]
      ],
      "matrix": null,
      "matrixSource": "Not exported in the source notebook. Rounded per-class reports cannot recover an exact confusion matrix."
    },
    {
      "id": "hgb",
      "name": "Histogram Gradient Boosting",
      "accuracy": 0.9868,
      "macroF1": 0.7464,
      "perClass": [
        [
          0.99,
          1.0,
          0.99
        ],
        [
          1.0,
          0.99,
          0.99
        ],
        [
          1.0,
          1.0,
          1.0
        ],
        [
          1.0,
          0.99,
          1.0
        ],
        [
          0.99,
          0.99,
          0.99
        ],
        [
          0.51,
          0.03,
          0.06
        ],
        [
          0.18,
          0.77,
          0.29
        ],
        [
          0.58,
          0.75,
          0.65
        ]
      ],
      "matrix": null,
      "matrixSource": "Not exported in the source notebook. Rounded per-class reports cannot recover an exact confusion matrix."
    },
    {
      "id": "xgb",
      "name": "XGBoost",
      "accuracy": 0.9888,
      "macroF1": 0.8528,
      "perClass": [
        [
          0.99,
          1.0,
          0.99
        ],
        [
          1.0,
          0.99,
          0.99
        ],
        [
          1.0,
          1.0,
          1.0
        ],
        [
          1.0,
          1.0,
          1.0
        ],
        [
          1.0,
          1.0,
          1.0
        ],
        [
          0.55,
          0.03,
          0.06
        ],
        [
          0.94,
          0.84,
          0.89
        ],
        [
          0.97,
          0.83,
          0.89
        ]
      ],
      "matrix": [
        [
          1077206,
          7,
          2,
          75,
          249,
          375,
          7,
          7
        ],
        [
          212,
          21682,
          0,
          1,
          0,
          0,
          0,
          0
        ],
        [
          27,
          0,
          15458,
          0,
          0,
          0,
          0,
          1
        ],
        [
          285,
          0,
          3,
          184901,
          9,
          0,
          11,
          0
        ],
        [
          178,
          0,
          0,
          2,
          59420,
          0,
          0,
          1
        ],
        [
          13769,
          1,
          0,
          2,
          0,
          457,
          0,
          0
        ],
        [
          16,
          0,
          0,
          25,
          10,
          0,
          285,
          3
        ],
        [
          70,
          4,
          1,
          0,
          3,
          0,
          0,
          372
        ]
      ],
      "matrixSource": "Transcribed from notebook cell 23 saved image; row totals verified."
    },
    {
      "id": "mlp",
      "name": "MLP \u00b7 128 / 64 / 32",
      "accuracy": 0.9231,
      "macroF1": 0.5613,
      "perClass": [
        [
          0.93,
          0.98,
          0.95
        ],
        [
          0.99,
          0.97,
          0.98
        ],
        [
          1.0,
          0.97,
          0.99
        ],
        [
          0.98,
          0.67,
          0.8
        ],
        [
          0.72,
          0.83,
          0.77
        ],
        [
          0.0,
          0.0,
          0.0
        ],
        [
          0.0,
          0.0,
          0.0
        ],
        [
          0.0,
          0.0,
          0.0
        ]
      ],
      "matrix": null,
      "matrixSource": "Not exported in the source notebook. Rounded per-class reports cannot recover an exact confusion matrix."
    }
  ],
  "notes": [
    "Per-class reports rounded to two decimals in source.",
    "XGBoost matrix transcribed from saved image, not inferred from rounded scores.",
    "Other model matrices unavailable; no fabricated values.",
    "No final test accuracy or macro-F1 exported in notebook."
  ]
};
