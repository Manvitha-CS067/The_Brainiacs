import pandas as pd
import random

#to load our existing CSV
df = pd.read_csv("D:\\TheBrainiacs(HTF)\\alumni_data_with_distances.csv")

#to make sure it has exactly 1000 rows
assert len(df) == 1000, "Your data must have 1000 entries to match USNs."

#to generate 1000 unique USNs
college_code = "4MW"
branches = ["CS", "ME", "CV", "EC", "EC"]  # Duplicated EC to balance a bit
years = list(range(2010, 2025))

usn_list = set()
while len(usn_list) < 1000:
    year = random.choice(years)
    branch = random.choice(branches)
    number = random.randint(1, 999)
    usn = f"{college_code}{str(year)[-2:]}{branch}{number:03d}"
    usn_list.add(usn)

usn_list = list(usn_list)

#to insert as first column
df.insert(0, "USN", usn_list)

#to save the new CSV
df.to_csv("D:\\\TheBrainiacs(HTF)\\alumni_data_with_usn.csv", index=False)
print("USNs added and file saved as 'alumni_data_with_usn.csv'")