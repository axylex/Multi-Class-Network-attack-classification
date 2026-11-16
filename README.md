# FlowLab — ES 335 project website

Multiclass Network Attack Classification from Network Flow Features

Adusumilli Viraat Krishna (24110016) · Omer Mohammed Mubeenuddin (24110228)

## Run the website

Open `index.html` directly, or serve this folder with `python -m http.server 8000` and visit `http://localhost:8000`. No build, backend, API key, npm dependency, font CDN, or chart CDN is required. All asset paths are relative, including under a GitHub Pages repository subpath.

Files: `index.html`, `styles.css`, `app.js`, `data/results.json`, `data/results.js`, `assets/` and this README. The JSON is the canonical downloadable data; `results.js` contains the same data as `window.RESULTS` so local file viewing works without fetch restrictions. Keep them synchronized when editing data. `.nojekyll` supports static Pages delivery. The `dist` copy is only for the private preview host and is not needed on GitHub Pages.

## GitHub Pages deployment

1. Copy the website files and folders to your repository's `docs/` directory (or repository root), without the private preview's `.openai`, `.git`, `dist` or ZIP files.
2. Commit and push to the repository.
3. In GitHub Settings → Pages choose Deploy from a branch, `main`, and `/docs` (or `/` for root deployment).
4. Visit `https://axylex.github.io/Multi-Class-Network-attack-classification/` once GitHub confirms deployment. That URL is an expected address, not proof of deployment.

## Evidence and data contract

Repository: https://github.com/axylex/Multi-Class-Network-attack-classification

Reviewed commit: `b8401c1cbdad95366c2d76509542c526c0535d98`. Source: `ML_Evaluation.ipynb` saved outputs; training was not rerun.

- Cell 9: dataset class counts. Cell 14: splits; cell 16: training subsample.
- Cells 20, 23, 24, 27: validation scores. Per-class reports are rounded to 2 decimals.
- Cell 23 saved image: XGBoost validation confusion matrix, manually transcribed and checked against all row supports and reported accuracy.
- Cells 29 and 31: test ROC and PR figures. Do not label validation accuracy or macro-F1 as test results.
- Majority baseline: calculated analytically from validation supports, not an additional trained model.
- Other model matrices are `null`, because no exact counts are exported. Their explorer gives an explicit missing-data state; it never fabricates matrices from rounded reports.

Each model object has `id`, `name`, `accuracy`, `macroF1`, `perClass` (precision, recall, F1 in the shared class order), `matrix` (true rows, predicted columns), and `matrixSource`. To complete missing matrices, export `confusion_matrix(y_val, model.predict(X_val), labels=range(8)).tolist()` from the original environment and replace the corresponding null. Verify row sums equal validation supports. Keep classification report and matrix from the same run/split.

## Reproduce the ML analysis

1. Obtain CIC-IDS-Collection from https://www.kaggle.com/dsv/4477547 under its access/license terms. Record exact release, URL, checksum and which constituent datasets are present. The catalog includes four datasets; the notebook's local filename alone does not verify its contents.
2. Install Python with pandas, NumPy, pyarrow, scikit-learn, XGBoost, Matplotlib and seaborn. `[INSERT exact original Python and package versions]`; no lockfile was provided, so exact-environment reproduction is not yet guaranteed.
3. Open the source notebook and change `/content/drive/MyDrive/cic-collection.parquet` to the acquired file path. Run cleaning/splitting and checkpoint cells before model cells; skipping them requires the correct existing `train_clean.parquet`, `val_clean.parquet`, `test_clean.parquet`.
4. Record duplicate column/row checks, conflicting labels, missing/infinite values, zero-variance features and class counts. The source notebook does not implement all proposed checks.
5. Preserve seed 42 and the 70/15/15 stratified split, then the 20% stratified training sample. Check finite values and downcasting precision; source float16 conversion generated warnings. Fit learned transforms/feature selection only on training folds.
6. Compare models on validation. Freeze the selected model and thresholds before final test evaluation. Export exact reports, prediction arrays, matrices, ROC/PR arrays, runtime and package versions.

## Interactions and limitations

The model selector updates metrics, per-class precision/recall/F1, and available confusion matrices. Matrix cells support hover, click and keyboard focus. Toggle row percentages/counts; count color uses a logarithmic scale and percentage color is row-normalized. The class distribution switches between logarithmic and linear scales.

The flow inspector is a **synthetic, uncalibrated educational heuristic** using five independent sliders, class-specific additive weights and softmax. Presets are invented. Its contributions are the toy score terms, not SHAP or model feature importance. The threshold controls review/accept status; it does not change probabilities. There is no trained model inference in this static website.

## AI-use disclosure

AI assisted website code, design, result transcription, methodological review, and the toy simulator. Training was not rerun for website construction. `[TEAM TO COMPLETE: original analysis AI tools, tasks assisted, and verification performed.]` Do not imply an unverified AI-use history is known.

## Privacy

This site ships aggregate metrics, notebook figures and synthetic examples only. No private records, raw packet payloads, credentials or API keys are included in the website package. The inspector sends no input values anywhere. Third-party repository and reference links are user-initiated navigation.

## Submission checklist

- [x] Seven rubric sections, team/course metadata and explicit scope.
- [x] Class imbalance, cleaning, label leakage, split and scaler reasoning.
- [x] Baselines, five trained-model reports, and methodological limitations.
- [x] Two interactive modules with honest evidence/simulation labels.
- [x] Relative static paths, responsive layout, keyboard-accessible controls.
- [x] Code/data links, references, AI disclosure and privacy section.
- [ ] Team review of AI-use disclosure and experimental claims.
- [ ] Exact dataset version/hash and dependency versions.
- [ ] Duplicate/constant-feature audit and precision/downcasting audit.
- [ ] Missing exact confusion matrices, final test classification metrics, numeric curve exports.
- [ ] Confidence intervals or repeated-seed results; host/time-disjoint evaluation.
- [ ] Verify your GitHub Pages publication after copying files into the repository.

Formal dataset, library and paper references are included in the website's References section. No external website template or third-party JavaScript library was used.
