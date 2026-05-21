# Shop Admin React

Frontend en React + TypeScript + Vite + Tailwind para la API de e-commerce.

## API base

`https://o6duby7xvh.execute-api.us-east-1.amazonaws.com/prod/`

## Funcionalidades

- CRUD de usuarios y productos
- Compras con validación local de `userId` y `productId`
- Carga de imágenes vía URL prefirmada S3 (`POST /products/upload-url` + `PUT` binario)
- Modales para edición y confirmación de eliminación
- Sin `alert()`, `prompt()` ni `confirm()` nativos

## Desarrollo

```bash
cd C:\Users\camil\Projects\shop-admin-react
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Listo para conectar este repositorio a AWS Amplify y desplegar desde la rama `main`.
