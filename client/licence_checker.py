import hashlib
import uuid
import requests

def get_hwid():
    return hashlib.sha256(uuid.getnode().to_bytes(6, 'little')).hexdigest()

def check_license(license_key):
    hwid = get_hwid()
    res = requests.post("https://licence-check-ak47.vercel.app/api/verify", json={"key": license_key, "hwid": hwid})
    return res.json()

if __name__ == "__main__":
    license = input("Enter license key: ")
    result = check_license(license)
    print("Server Response:", result)
