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
                print(f"Loading model from {model_path}", file=sys.stderr)
                self.model = torch.load(model_path, map_location=DEVICE, weights_only=False)
                self.model.device = DEVICE
                self.model.eval()
                print(f"✓ Model loaded successfully. Model type: {type(self.model)}", file=sys.stderr)
                print(f"✓ Model is on device: {next(self.model.parameters()).device}", file=sys.stderr)
            else:
                print("❌ Model path not provided", file=sys.stderr)
                self.model = None
        except Exception as e:
            print(f"❌ Error loading model: {e}", file=sys.stderr)
            self.model = None
    
    def preprocess_lob_data(self, lob_data):
        """Convert LOB data to the format expected by the model"""
        try:
            # LOB data comes as array of arrays where each inner array has 20 levels of [bid, bid_vol, ask, ask_vol]
            # We need to convert this to the shape expected by the model: (1, 1, 4500, 80)
            
            print(f"Raw LOB data type: {type(lob_data)}, length: {len(lob_data) if isinstance(lob_data, list) else 'N/A'}", file=sys.stderr)
            
            book = np.array(lob_data)
            print(f"Initial book shape: {book.shape}", file=sys.stderr)
            
            # Expected input: list of 4500 timesteps, each with 20 levels of 4 values (bid, bid_vol, ask, ask_vol)
            # So we expect shape (4500, 20, 4) which we need to reshape to (1, 4500, 80)
            # The model expects 4D input: (batch_size, channels, height, width) = (1, 1, 4500, 80)
            
            if book.ndim == 3 and book.shape[1] == 20 and book.shape[2] == 4:
                # Shape is (4500, 20, 4) - this is what we expect
                # Reshape to (4500, 80) first by flattening the last two dimensions
                book = book.reshape(book.shape[0], 80)
                # Then add batch and channel dimensions: (1, 1, 4500, 80)
                book = book.reshape(1, 1, book.shape[0], 80)
                
            elif book.ndim == 2 and book.shape[1] == 80:
                # Shape is already (4500, 80)
                # Just add batch and channel dimensions: (1, 1, 4500, 80)
                book = book.reshape(1, 1, book.shape[0], 80)
                
            elif book.ndim == 1:
                # This might be a flattened array
                total_elements = len(book)
                if total_elements % 80 == 0:
                    timesteps = total_elements // 80
                    book = book.reshape(1, 1, timesteps, 80)
                else:
                    raise ValueError(f"Cannot reshape 1D array of length {total_elements} to format with 80 features per timestep")
                    
            else:
                raise ValueError(f"Unexpected LOB data shape: {book.shape}. Expected (N, 20, 4) or (N, 80)")
            
            print(f"Final preprocessed book shape: {book.shape}", file=sys.stderr)
            
            # Log some sample values to check if input data is actually changing
            print(f"Sample input values - first 5 features of first timestep: {book[0,0,0,:5]}", file=sys.stderr)
            print(f"Sample input values - first 5 features of last timestep: {book[0,0,-1,:5]}", file=sys.stderr)
            print(f"Input data range - min: {np.min(book):.6f}, max: {np.max(book):.6f}, mean: {np.mean(book):.6f}", file=sys.stderr)
            
            # Apply the exact same normalization used during training
            # Price normalization: (price - 100_000) / 5_000 for even indices (0, 2, 4, 6, ...)
            # Volume normalization: (volume - 0.2) / 1 for odd indices (1, 3, 5, 7, ...)
            mean_price, std_price, mean_volume, std_volume = [100_000, 5_000, 0.2, 1]
            
            # Apply normalization to the flattened features (80 features per timestep)
            for i in range(book.shape[2]):  # For each timestep
                for j in range(book.shape[3]):  # For each feature (0 to 79)
                    if j % 2 == 0:  # Even indices: prices
                        book[0, 0, i, j] = (book[0, 0, i, j] - mean_price) / std_price
                    else:  # Odd indices: volumes
                        book[0, 0, i, j] = (book[0, 0, i, j] - mean_volume) / std_volume
            
            print(f"After training-compatible normalization - min: {np.min(book):.6f}, max: {np.max(book):.6f}, mean: {np.mean(book):.6f}", file=sys.stderr)
            
            # Ensure we have float32 data type for the model
            return book.astype(np.float32)
            
        except Exception as e:
            print(f"Error preprocessing data: {e}", file=sys.stderr)
            print(f"LOB data info - type: {type(lob_data)}, shape if array: {getattr(lob_data, 'shape', 'N/A')}", file=sys.stderr)
            if isinstance(lob_data, list) and len(lob_data) > 0:
                print(f"First element type: {type(lob_data[0])}, shape if array: {getattr(lob_data[0], 'shape', 'N/A')}", file=sys.stderr)
            return None
    
    def predict(self, lob_data):
        """Make prediction on LOB data"""
        try:
            # Check if model is loaded
            if self.model is None:
                return {"error": "Model not loaded"}
            
            processed_data = self.preprocess_lob_data(lob_data)
            if processed_data is None:
                return {"error": "Failed to preprocess data"}
            
            print(f"Using real BDLOB model for prediction", file=sys.stderr)
            
            # Real model prediction
            with torch.no_grad():
                # processed_data already has shape (1, 1, 4500, 80) - no need to unsqueeze
                input_tensor = torch.from_numpy(processed_data).float().to(DEVICE)
                print(f"Input tensor shape: {input_tensor.shape}", file=sys.stderr)
                
                # Make prediction with the real model
                output = self.model(input_tensor)
                print(f"Raw model output shape: {output.shape}", file=sys.stderr)
                print(f"Raw model output: {output}", file=sys.stderr)
                
                # Convert to probabilities
                probabilities = torch.softmax(output, dim=1).cpu().numpy()[0]
                prediction_class = np.argmax(probabilities)
                confidence = float(np.max(probabilities))
                
                print(f"Real prediction - class: {prediction_class}, probabilities: {probabilities}, confidence: {confidence}", file=sys.stderr)
                
                return {
                    "prediction_class": int(prediction_class),
                    "probabilities": probabilities.tolist(),
                    "confidence": confidence,
                }
            
        except Exception as e:
            print(f"❌ Prediction failed: {str(e)}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
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