## API Gateways

#### Noticias-Eventos

- /noticiasYeventos
  - GET
  - PUT
  - /{id}
    - GET
    - DELETE
    - PATCH

#### Imagenes

- /images
  - POST
  - /{folder}
    - /{file}
      - GET
      - DELETE


## Lambdas

- [NoticiasHandler](NoticiasHandler.mjs)
- [ImagenesHandler](imagesHandler.py)


## DinamoDB

#### Noticias-Eventos

Estructura de un elemento:

```javascript
{
    "id": "id number", // uuid string
    "active": true, // boolean
    "descripcion": "La descripcion", // string
    "fecha": "YYYY-MM-DD", // string date
    "resumen": "El resumen", // string
    "s3key": "folder/file", // image location string
    "titulo": "El titulo" // string
}
```

## S3 Bucket

#### Imagenes

- folder
  - image.extention
