from typing import Optional

from pydantic import BaseModel, Field


class ProductInformation(BaseModel):
    product_name: Optional[str] = Field(
        default=None,
        description="Name or brand name of the packaged product"
    )

    product_type: Optional[str] = Field(
        default=None,
        description="Type or category of the product"
    )

    brand_name: Optional[str] = Field(
        default=None,
        description=(
            "Brand name only, e.g. 'Tata' for 'Tata Salt'. "
            "Distinct from the full product_name."
        )
    )

    mrp: Optional[str] = Field(
        default=None,
        description="Maximum Retail Price exactly as found on the package"
    )

    net_quantity: Optional[str] = Field(
        default=None,
        description="Net quantity exactly as found on the package"
    )

    manufacturer: Optional[str] = Field(
        default=None,
        description="Manufacturer, packer or importer name only"
    )

    manufacturer_address: Optional[str] = Field(
        default=None,
        description="Manufacturer, packer or importer postal address, if present"
    )

    manufacturing_date: Optional[str] = Field(
        default=None,
        description="Manufacturing or packing date if present"
    )

    expiry_date: Optional[str] = Field(
        default=None,
        description="Expiry or best before information if present"
    )

    consumer_care: Optional[str] = Field(
        default=None,
        description="Consumer care contact information"
    )

    country_of_origin: Optional[str] = Field(
        default=None,
        description="Country of origin if present"
    )

    batch_number: Optional[str] = Field(
        default=None,
        description="Batch or lot number if present"
    )

    ingredients: Optional[str] = Field(
        default=None,
        description="Ingredients information if present"
    )

    raw_text: Optional[str] = Field(
        default=None,
        description="Important raw OCR text used for extraction"
    )