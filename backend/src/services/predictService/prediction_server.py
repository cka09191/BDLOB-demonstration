import sys
import json
import torch
import numpy as np
import os

DEVICE= torch.device('cpu')
MODEL_PATH = 'bilob/BayesianDeepLOB_weights_exp_0406_custom_criteria_e_1s_k_4500_skip1_1e-06_zscore_each_20_criteria.pth'

class BDLOBPredictor:
    def __init__(self, model_path=None):
        self.model = None
        self.dataset = None
        self.load_model(model_path)
        
    def load_model(self, model_path):
        """Load the trained BDLOB model"""
        try:
            if model_path:
                self.model = torch.load(model_path, map_location=DEVICE, weights_only=False)
                self.model.device = DEVICE
                print(f"Loading model from {model_path}", file=sys.stderr)
                self.model.eval()
            else:
                print("Model not found", file=sys.stderr)
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
    
    def preprocess_lob_data(self, lob_data):
        """Convert LOB data to the format expected by the model"""
        try:
            book = np.array(lob_data)  # Shape: (4500, 20, 4) -> (1, 1, 4500, 80)
            if book.ndim == 3:
                book = book.reshape(1, 4500, 80)
            else:
                raise ValueError(f"LOB data must be 3D array: {book.ndim}D array({book.shape}) provided")
            print(f"Preprocessed book shape: {book.shape}", file=sys.stderr)
            return book.astype(np.float32)
            
        except Exception as e:
            print(f"Error preprocessing data: {e}", file=sys.stderr)
            return None
    
    def predict(self, lob_data):
        """Make prediction on LOB data"""
        try:
            processed_data = self.preprocess_lob_data(lob_data)
            if processed_data is None:
                return {"error": "Failed to preprocess data"}
            
            # a mock prediction
            # mock_prediction = {
            #     "prediction_class": np.random.randint(0, 3),  # 0, 1, or 2
            #     "probabilities": [0.3, 0.4, 0.3],  # Mock probabilities
            #     "confidence": 0.75,
            #     "processed data": processed_data.tolist(),  # Include processed data for debugging
            #     "processed data type": str(type(processed_data))
            # }
            
            # return mock_prediction
            
            # Actual prediction
            with torch.no_grad():
                input_tensor = torch.from_numpy(processed_data).float().unsqueeze(0).to(DEVICE)
                output = self.model(input_tensor)
                probabilities = torch.softmax(output, dim=1).numpy()[0]
                prediction_class = np.argmax(probabilities)
                
                return {
                    "prediction_class": int(prediction_class),
                    "probabilities": probabilities.tolist(),
                    "confidence": float(np.max(probabilities)),
                }
            
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}

def main():
    model_path = os.path.join(os.path.dirname(__file__), MODEL_PATH)
    predictor = BDLOBPredictor(model_path=model_path)
    print("BDLOB Prediction Server started", file=sys.stderr)
    
    for line in sys.stdin:
        try:
            request = json.loads(line.strip())
            
            if request.get('action') == 'predict':
                prediction = predictor.predict(request['data'])
                response = {
                    'id': request.get('id'),
                    'prediction': prediction
                }
                print(json.dumps(response))
                sys.stdout.flush()
                
        except Exception as e:
            error_response = {
                'id': request.get('id', 'unknown'),
                'error': str(e)
            }
            print(json.dumps(error_response))
            sys.stdout.flush()

if __name__ == "__main__":
    main()