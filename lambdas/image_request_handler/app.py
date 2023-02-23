def handler(event, context):
    request = event["Records"][0]['cf']['request']
    print(event)

    return request