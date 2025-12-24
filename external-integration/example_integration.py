"""Example external integration adapter placeholder."""

import requests


class ExampleIntegration:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def ping(self) -> bool:
        try:
            r = requests.get(self.base_url)
            return r.status_code == 200
        except Exception:
            return False


if __name__ == "__main__":
    print("This is a placeholder integration module.")
