# FlowLab — ES 335 Project

**Multiclass Network Attack Classification from Network Flow Features**

FlowLab uses 53 audited network-flow features to classify traffic as `Benign` or one of seven attack types (`Botnet`, `Bruteforce`, `DDoS`, `DoS`, `Infiltration`, `Portscan`, `Webattack`). The project compares five trained models against a majority baseline and presents their validation confusion matrices, held-out test reports, and an in-browser flow inspector.

- **Live Interactive Website:** https://axylex.github.io/Multiclass-Network-Attack-Classification-from-Network-Flow-Features/
- **Team:** Adusumilli Viraat Krishna (`24110016`) and Omer Mohammed Mubeenuddin (`24110228`)

## Repository Structure

- [`index.html`](index.html) — Static interactive report, model/confusion matrix explorer, and in-browser flow inspector (GitHub Pages entrypoint).
- [`ML_Evaluation.ipynb`](ML_Evaluation.ipynb) — End-to-end data audit, deduplication, stratified 70/15/15 split (`seed=42`), training-only preprocessing, model training, and evaluation.

## Dataset Access

- **Source:** [CIC-IDS-Collection on Kaggle](https://www.kaggle.com/dsv/4477547) (`cic-collection.parquet`, 9,167,581 rows × 59 columns before deduplication).
- **Privacy & Credentials:** No private data, credentials, or API keys are stored in this repository. All published artifacts contain only aggregate metrics, model parameters, and eight public benchmark test flows.

## Setup & Rebuild Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/axylex/Multiclass-Network-Attack-Classification-from-Network-Flow-Features.git
   cd Multiclass-Network-Attack-Classification-from-Network-Flow-Features
   ```
2. Download the dataset: [CIC-IDS-Collection on Kaggle](https://www.kaggle.com/dsv/4477547) under its terms of use.
3. Install Python dependencies: pip install pandas numpy scikit-learn xgboost pyarrow matplotlib seaborn jupyter
4. Re-run the pipeline: Open ML_Evaluation.ipynb, point dataset_path to your local cic-collection.parquet file, and run all cells (seed=42) to reproduce the duplicate/feature audit, checkpoints, validation confusion matrices, and held-out test metrics.
5. Preview the site locally: Serve the root directory with any static server (e.g., python -m http.server 8000) and open http://localhost:8000.

