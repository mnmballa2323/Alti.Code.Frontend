import boto3
import os
import time
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize the AWS Marketplace Metering Client
metering_client = boto3.client('meteringmarketplace', region_name='us-east-1')

PRODUCT_CODE = os.environ.get('PRODUCT_CODE', 'alti-enterprise-data-plane')
USAGE_DIMENSION = 'AI_TOKENS_PROCESSED_1M'

def handler(event, context):
    """
    AWS Lambda function invoked by the Alti Data Plane to meter AI token usage.
    This charges the customer directly on their AWS invoice.
    """
    try:
        # Extract token usage from the secure event payload
        tokens_processed = event.get('tokens_processed', 0)
        customer_id = event.get('customer_identifier')
        
        if not customer_id or tokens_processed <= 0:
            logger.error("Invalid metering payload.")
            return {"status": "error", "message": "Invalid payload"}

        # Convert to 1M token blocks (Marketplace dimension)
        quantity = max(1, int(tokens_processed / 1_000_000))

        logger.info(f"Metering {quantity} units of {USAGE_DIMENSION} for customer {customer_id}")

        # Call the AWS Marketplace MeterUsage API
        response = metering_client.meter_usage(
            ProductCode=PRODUCT_CODE,
            Timestamp=int(time.time()),
            UsageDimension=USAGE_DIMENSION,
            UsageQuantity=quantity,
            DryRun=False
        )
        
        logger.info(f"Metering successful. RecordId: {response.get('MeteringRecordId')}")
        
        return {
            "status": "success",
            "record_id": response.get('MeteringRecordId')
        }
        
    except Exception as e:
        logger.error(f"Failed to submit metering record: {str(e)}")
        # In a real scenario, failed records should be queued in an SQS Dead Letter Queue
        # to ensure no revenue is lost due to transient API failures.
        raise e
