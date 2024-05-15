# TeamMSc09

*Assignment of COM6504 Intelligent Web*

Group member

- Chunyuan Deng
- Liangyu Huang
- Chenyu Wang 
- Haoyu Liang

Click to view [Assignemnt Instruction](https://learn-eu-central-1-prod-fleet01-xythos.content.blackboardcdn.com/5c8f80ee07c44/46117804?X-Blackboard-S3-Bucket=learn-eu-central-1-prod-fleet01-xythos&X-Blackboard-Expiration=1715796000000&X-Blackboard-Signature=iqUKx0AELlBcWYbK4CiZZmC8wtUwHJJzZHtPDumrl64%3D&X-Blackboard-Client-Id=309431&X-Blackboard-S3-Region=eu-central-1&response-cache-control=private%2C%20max-age%3D21600&response-content-disposition=inline%3B%20filename%2A%3DUTF-8%27%27Assignment%25202023_2024.docx%2520%25281%2529.pdf&response-content-type=application%2Fpdf&X-Amz-Security-Token=IQoJb3JpZ2luX2VjED0aDGV1LWNlbnRyYWwtMSJIMEYCIQCafoLogLhwSp%2FpycJxLfmQmQMKtUREfnjml%2BFfdMo8%2BwIhALx9DDlwsFXyCHV7NVcMwnVWC8W0y7B%2FDuqYACMyXWhqKsYFCKb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQBBoMNjM1NTY3OTI0MTgzIgzMlQONg2DP5RrzvCoqmgUuiM8Nw3bjB8Ilbqi6glOacU7NQWAJynjgXJRfbmjBPZuVbj72Bq6R3VpSUW15z%2FdqjagY%2Fyw6tH6tyLm9ek807Zy%2BfEKh%2BaUDA9ywh6jLbOMIgluJiEpAkR4viOjxYAcp5aVHQSxr2BY27g2IiNdO5kOv154KPnJxh1cijwmz9nB3dc2G0VKnJpthnNlLIFm%2BR5JXhS8PWtcBTnHrH97wlVpzTAJHhrIdVD7P1oYnAksjmZrrTT9%2B%2FFZ%2B2sJs1mOgVevDItdwygY2GaFcgy%2B8hocW1K%2BCxr%2BU%2FfFdzXVQo0jc3z3BEVA0Et5gUyQrwhAy%2B4oSDW9%2Fi%2F4xrgvzP7UUiyIj6ax%2BikBiNWfQPpYfhUfjABI91aQJe9iWGqJjosGv2F4KVWjy8jl5DbLJ9aQri%2FDoxVleF7I5T9Y%2BOI14nU4MSRPrxrXhnNwBHfgPTMw1yhPFsTqAfzWGtoEjufVXaqZXbHpg%2FaD4ZkSDClpwiVNlw7yivBlZoob192g6R5I0LY6fvnezZ%2FgHIvECRUQYyzkhnjKbc7RpM5MzN8lkpJNWKPjQDwgAOHZXnwAr20kfAXEFGqs%2FQYPHf%2F10Yce2PdXiL6IoLNRgP3y5wcHUB9Dywb%2Fc8rG0c4eaEr%2BNUqERu1KORb%2BSY6%2FJvZnJpavLasv2%2BMlyryHqwV81zIHSgGjuHGsdhNWpTCMqs1yJBPnPx%2FyfsTXvCnxyr%2FtruTXWGmXixJyxFdJx9aAxrpeoFa6H9oh1pgUn5%2Bhwg3l1JHynJr46EK%2BqUrmuXTlbMgjLIjI6U3zsJvAwOBeFUZrpnd5Wv5wAm9gBp1BM3oWS6o5GdRWOA8xO9DsFP8rZkYkbjxUvk79UYx4bJWCD7xhrXu8iUP3yA3M%2F%2F%2BQw296SsgY6sAHM%2F9QABGTpXyUdZFZ4pIlUQdSUlpYUMoe%2FlGvVoJ6MAdpQYRBHnGr%2FqvAGsvAJo2eVuM0pcMV%2BeIZ94ivxo5%2Fdy20cLdgb%2B718rOQVYkfDEAqegAx4gwJn9e6ObplFS5QZnZgl87b4arRL1Tw1JSWk7Yxfj8LPJ784WWiwJ45aHfXyp4x5mQCQggmSZKvoKsXcYfvAzLwiCcDnQQp42zwgftGJYK4eqsKGn%2B3IM52slw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240515T120000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=21600&X-Amz-Credential=ASIAZH6WM4PLWZEZGE32%2F20240515%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Signature=2d5560ca6c228bdcf9a723c69be83c3c55982f9822fc9718277adc7a79936d36#)

## Get Started

We need to start the project via service-app and web-app separately.

```shell
cd solution
```

All codes are in the `solution` directory.

### Start service-app

```shell
cd service-app
npm install
npm run initdb
npm run start
```

Please note that this command `npm run initdb` applies to the initialization of the mongoDB database. If you plan to test our functionality, I recommend that you run this command to initialise the database first.

### Start web-app

```shell
cd web-app
npm install
npm run start
```


### web-app

Front end of the project.

### service-app

Back end of the project.

Connect MongoDB.