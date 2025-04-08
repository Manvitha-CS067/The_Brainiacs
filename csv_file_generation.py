#to import required libraries
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import time
import os


# to set up geolocator
geolocator = Nominatim(user_agent="alumni_locator")


# to load your CSV file
csv_file = "D:\\TheBrainiacs(HTF)\\alumni_data.csv"
df = pd.read_csv(csv_file, encoding='latin1')  # or 'cp1252'

#to hardcode college coordinates (Mangalore, Karnataka)
college_coords = (12.9141, 74.8560)  # latitude, longitude


# to define batch parameters
batch_size = 50
folder_path = "D:\\TheBrainiacs(HTF)\\batches\\"
os.makedirs(folder_path, exist_ok=True)  # Create folder if not exists

# to start batch processing
start_index = 0
total = len(df)
batch_number = 1

while start_index < total:
    end_index = min(start_index + batch_size, total)
    batch_df = df.iloc[start_index:end_index].copy()

    for i, row in batch_df.iterrows():
        location = row['Location']
        try:
            loc = geolocator.geocode(location)
            if loc:
                alumni_coords = (loc.latitude, loc.longitude)
                distance = geodesic(college_coords, alumni_coords).km
                batch_df.at[i, 'Distance'] = round(distance, 2)
            else:
                batch_df.at[i, 'Distance'] = None
        except:
            batch_df.at[i, 'Distance'] = None
        time.sleep(1)

    #to save batch to CSV
    batch_file = os.path.join(folder_path, f"batch_{batch_number}.csv")
    batch_df.to_csv(batch_file, index=False)
    print(f"Batch {batch_number} processed and saved ({start_index} to {end_index})")

    start_index = end_index
    batch_number += 1


import pandas as pd
import os

# folder where our batch files are stored
folder_path = "D:\\TheBrainiacs(HTF)\\batches\\"

#to get all CSV files in the folder that start with 'batch_'
batch_files = [f for f in os.listdir(folder_path) if f.startswith("batch_") and f.endswith(".csv")]

#to sort batch files by batch number (optional but keeps order clean)
batch_files.sort(key=lambda x: int(x.split("_")[1].split(".")[0]))

#to merge all batches
merged_df = pd.concat([pd.read_csv(os.path.join(folder_path, file)) for file in batch_files], ignore_index=True)

#to save merged file
merged_file_path = "D:\\TheBrainiacs(HTF)\\alumni_data_with_distances.csv"
merged_df.to_csv(merged_file_path, index=False)

print(f"All {len(batch_files)} batches merged and saved to:\n{merged_file_path}")
