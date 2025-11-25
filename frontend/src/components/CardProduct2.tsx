import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
  Chip,
  Stack,
  CardActions,
  Button,
  Rating,
} from "@mui/material";

const ProductCard = ({product} : any) => {
    const {
        title,
        price,
        image,
        brand,
        store,
        rating,
        category,
        sizes,
        colors,
    } = product;
    
    console.log(title)
  return (
    <Card sx={{ maxWidth: 350, borderRadius: 3, overflow: "hidden", boxShadow: 4 }}>
      {/* Imagen */}
      <CardMedia
        component="img"
        height="200"
        image={image}
        alt={title}
        sx={{ objectFit: "cover" }}
      />

      <CardContent>
        {/* Info de la prenda */}
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>

        {/* Precio */}
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
          ${price}
        </Typography>

        {/* Categoría */}
        <Chip label={category} size="small" sx={{ mt: 1 }} />

        {/* Tallas */}
        {sizes && sizes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600}>Tallas disponibles:</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {sizes.map((size : any) => (
                <Chip key={size} label={size} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}

        {/* Colores */}
        {colors && colors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600}>Colores:</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {colors.map((color : any) => (
                <Chip
                  key={color}
                  label={color}
                  size="small"
                  sx={{ background: "#f5f5f5" }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Info de la marca/store */}
        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={brand?.logo} alt={brand?.name} />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {brand?.name || store?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {store?.country ? `${store.country}` : ""}
            </Typography>
          </Box>
        </Box>

        {/* Rating */}
        {rating && (
          <Box sx={{ mt: 1 }}>
            <Rating value={rating} precision={0.5} readOnly size="small" />
          </Box>
        )}
      </CardContent>

      {/* Acciones */}
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Button size="small" variant="contained">Ver detalles</Button>
        <Button size="small" variant="outlined">Favorito</Button>
      </CardActions>
    </Card>
  );
}

export default ProductCard