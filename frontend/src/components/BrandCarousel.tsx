import { Box, Typography, Stack } from "@mui/material";
import type { Brand } from "../Types/Types";

export default function BrandCarousel({ brands }: { brands: Brand[] | []}) {
  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        display: "flex",
        py: 2,
        px: 2,

        scrollSnapType: "x mandatory",     // 👈 Scroll snap activado
        WebkitOverflowScrolling: "touch",   // Súper suave en móvil
        scrollbarWidth: "none",             // Firefox sin scrollbar
      }}
    >
      <Stack direction="row" spacing={2} sx={{ px: 2 }}>
        {brands.map((brand, index) => (
          <Box
            key={index}
            sx={{
              flex: "0 0 auto",
              scrollSnapAlign: "center", 

              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #e0e0e0",
                backgroundColor: brand.logo?.backgroundColor || '#FFFFFF',

                transition: "all 0.25s ease",
                boxShadow: "0 0 0 rgba(0,0,0,0)",
                alignContent: "center",


                "&:hover": {
                  transform: "scale(1.12)",
                  borderColor: "#1976d2",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
                },
              }}
            >
              <img
                src={brand.logo?.src}
                alt={brand.name}
                style={{
                  width: "80%",
                  height: "80%",
                  objectFit: "contain", 
                }}
              />
            </Box>

            <Typography
              variant="subtitle1"
              sx={{ display: "block", mt: 0.5, whiteSpace: "nowrap" }}
            >
              {brand.name}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
    
  );
}