import os
import re
import time
from typing import List, Optional

from app.schemas.product import ProductInformation
from app.utils.prompts import PRODUCT_EXTRACTION_PROMPT


class GeminiService:

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
        self.client = None

        if self.api_key and not self.api_key.startswith("YOUR_"):
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print(f"Gemini client initialized with model: {self.model}")
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini client: {e}")
        else:
            print("Notice: GEMINI_API_KEY is not set or uses placeholder. Fallback regex extraction active.")

    def structure_product_data(self, ocr_text: List[str]) -> ProductInformation:
        combined_text = "\n".join(f"- {text}" for text in ocr_text)

        if self.client:
            from google.genai import types

            prompt = f"{PRODUCT_EXTRACTION_PROMPT}\n\nOCR TEXT:\n\n{combined_text}\n"

            # Transient network/SSL errors (common with long-lived HTTPS
            # clients on flaky connections, e.g. "SSL: UNEXPECTED_EOF_WHILE_READING")
            # almost always succeed on an immediate retry with a fresh
            # connection, so give it up to 3 attempts before falling back.
            max_attempts = 3
            last_error = None

            for attempt in range(1, max_attempts + 1):
                try:
                    response = self.client.models.generate_content(
                        model=self.model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=ProductInformation,
                            temperature=0
                        )
                    )

                    if response.text:
                        product = ProductInformation.model_validate_json(response.text)
                        product.raw_text = "\n".join(ocr_text)
                        return product

                    last_error = "Empty response from Gemini"
                except Exception as error:
                    last_error = error
                    if attempt < max_attempts:
                        print(
                            f"Gemini API call failed (attempt {attempt}/"
                            f"{max_attempts}), retrying: {error}"
                        )
                        time.sleep(1)

            print(f"Gemini API call failed, switching to regex fallback: {last_error}")

        # Fallback regex extraction logic
        return self._fallback_regex_extraction(ocr_text)

    def _fallback_regex_extraction(self, ocr_text: List[str]) -> ProductInformation:
        full_text = "\n".join(ocr_text)
        
        mrp = None
        net_quantity = None
        mfg_date = None
        exp_date = None
        brand_name = None
        product_name = None
        manufacturer = None
        country_of_origin = None
        batch_number = None
        consumer_care = None

        for line in ocr_text:
            # MRP pattern
            if not mrp:
                mrp_match = re.search(r'(?:MRP|RS|₹|\$)\s*:?\s*([\d,.]+)', line, re.IGNORECASE)
                if mrp_match:
                    mrp = f"₹{mrp_match.group(1)}"

            # Net Quantity pattern
            if not net_quantity:
                net_match = re.search(r'(?:NET\s*(?:QTY|QUANTITY|WT|WEIGHT)|WEIGHT|QTY)\s*:?\s*([\d\.]+\s*(?:g|kg|ml|l|gm|grams|kgm)?)', line, re.IGNORECASE)
                if net_match:
                    net_quantity = net_match.group(1)
                elif re.search(r'^\d+\s*(?:g|kg|ml|l|gm|grams)$', line, re.IGNORECASE):
                    net_quantity = line.strip()

            # Date pattern
            if not mfg_date:
                mfg_match = re.search(r'(?:MFG|PACKED|MFD|DOM)\s*:?\s*([\d{2,4}[-/\.]\d{2}[-/\.]\d{2,4}|\w+\s*\d{4})', line, re.IGNORECASE)
                if mfg_match:
                    mfg_date = mfg_match.group(1)

            if not exp_date:
                exp_match = re.search(r'(?:EXP|USE BY|BEST BEFORE)\s*:?\s*([\d{2,4}[-/\.]\d{2}[-/\.]\d{2,4}|\w+\s*\d{4}|\d+\s*months)', line, re.IGNORECASE)
                if exp_match:
                    exp_date = exp_match.group(1)

            # Country pattern
            if not country_of_origin:
                co_match = re.search(r'(?:MADE IN|COUNTRY OF ORIGIN|ORIGIN)\s*:?\s*([A-Za-z\s]+)', line, re.IGNORECASE)
                if co_match:
                    country_of_origin = co_match.group(1).strip()
                elif "india" in line.lower():
                    country_of_origin = "India"

            # Batch pattern
            if not batch_number:
                b_match = re.search(r'(?:BATCH|LOT|B\.NO|L\.NO)\s*:?\s*([A-Za-z0-9\-_]+)', line, re.IGNORECASE)
                if b_match:
                    batch_number = b_match.group(1).strip()

            # Consumer Care pattern
            if not consumer_care:
                cc_match = re.search(r'(?:HELPLINE|CUSTOMER CARE|CARE|CONTACT|EMAIL|TOLL FREE)\s*:?\s*([^\n]+)', line, re.IGNORECASE)
                if cc_match:
                    consumer_care = cc_match.group(1).strip()

            # Brand/Manufacturer hints
            if not brand_name and any(b in line.lower() for b in ["tata", "nestle", "amul", "britannia", "fortune", "dabur", "hsn", "haldiram"]):
                brand_name = line.strip()

            if not manufacturer and any(m in line.lower() for m in ["mfd by", "manufactured by", "packed by", "marketed by"]):
                manufacturer = line.strip()

        if not product_name and ocr_text:
            product_name = ocr_text[0]
        if not brand_name and product_name:
            brand_name = product_name.split()[0]

        return ProductInformation(
            product_name=product_name,
            product_type="Packaged Commodity",
            brand_name=brand_name,
            mrp=mrp,
            net_quantity=net_quantity,
            manufacturer=manufacturer or "Manufacturer details detected on label",
            manufacturer_address=None,
            manufacturing_date=mfg_date,
            expiry_date=exp_date,
            consumer_care=consumer_care,
            country_of_origin=country_of_origin or "India",
            batch_number=batch_number,
            raw_text=full_text
        )