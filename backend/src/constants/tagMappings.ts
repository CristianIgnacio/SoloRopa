import { Fit, Style, Color, Gender } from "../scrapers/domain/enums";

export const GENDER_MAPPING: Record<string, Gender> = {
  // Hombre
  "hombre": Gender.HOMBRE,
  "hombres": Gender.HOMBRE,
  "varon": Gender.HOMBRE,
  "varones": Gender.HOMBRE,
  "man": Gender.HOMBRE,
  "men": Gender.HOMBRE,
  "chico": Gender.HOMBRE,

  // Mujer
  "mujer": Gender.MUJER,
  "mujeres": Gender.MUJER,
  "dama": Gender.MUJER,
  "damas": Gender.MUJER,
  "woman": Gender.MUJER,
  "women": Gender.MUJER,
  "chica": Gender.MUJER,

  // Unisex
  "unisex": Gender.UNISEX,
  "genderless": Gender.UNISEX,
};

export const COLOR_MAPPING: Record<string, Color> = {
  // English to Spanish
  "black": Color.NEGRO,
  "white": Color.BLANCO,
  "grey": Color.GRIS,
  "gray": Color.GRIS,
  "blue": Color.AZUL,
  "red": Color.ROJO,
  "green": Color.VERDE,
  "brown": Color.CAFE,
  "pink": Color.ROSADO,
  "yellow": Color.AMARILLO,
  "orange": Color.NARANJA,
  "purple": Color.MORADO,
  "cream": Color.CREMA,
  
  // Plurals and variations
  "negros": Color.NEGRO,
  "blancos": Color.BLANCO,
  "grises": Color.GRIS,
  "azules": Color.AZUL,
  "rojos": Color.ROJO,
  "verdes": Color.VERDE,
  "cafes": Color.CAFE,
  "rosados": Color.ROSADO,
  "amarillos": Color.AMARILLO,
  "naranjas": Color.NARANJA,
  "morados": Color.MORADO,

  // Others directly matching the enum
  "negro": Color.NEGRO,
  "blanco": Color.BLANCO,
  "gris": Color.GRIS,
  "azul": Color.AZUL,
  "rojo": Color.ROJO,
  "verde": Color.VERDE,
  "cafe": Color.CAFE,
  "rosado": Color.ROSADO,
  "amarillo": Color.AMARILLO,
  "naranja": Color.NARANJA,
  "morado": Color.MORADO,
  "crema": Color.CREMA,
  "beige": Color.BEIGE,
  "stone": Color.STONE,
  "multicolor": Color.MULTICOLOR,
};

export const FIT_MAPPING: Record<string, Fit> = {
  "oversized": Fit.OVERSIZE,
  "oversize": Fit.OVERSIZE,
  
  "regular": Fit.REGULAR,
  
  "boxy": Fit.BOXY,
  
  "slim": Fit.SLIM,
  "ajustado": Fit.SLIM,
  "pitillo": Fit.SLIM,
  "skinny": Fit.SLIM,
  
  "baggy": Fit.BAGGY,
  "ancho": Fit.BAGGY,
  "anchos": Fit.BAGGY,
  "suelto": Fit.BAGGY,

  "relaxed": Fit.RELAXED,
  
  "cropped": Fit.CROPPED,
  "crop": Fit.CROPPED,
  "corto": Fit.CROPPED,
};

export const STYLE_MAPPING: Record<string, Style> = {
  "streetwear": Style.STREETWEAR,
  "street": Style.STREETWEAR,
  "urbano": Style.URBANO,
  "urban": Style.URBANO,
  "minimal": Style.MINIMAL,
  "minimalist": Style.MINIMAL,
  "minimalista": Style.MINIMAL,
  "skate": Style.SKATE,
  "skater": Style.SKATE,
  "skateboarding": Style.SKATE,
  "vintage": Style.VINTAGE,
  "retro": Style.VINTAGE,
  "dark": Style.DARK,
  "goth": Style.GOTH,
  "gothic": Style.GOTH,
  "gotico": Style.GOTH,
  "y2k": Style.Y2K,
  "2000s": Style.Y2K,
  "workwear": Style.WORKWEAR,
  "cargo": Style.WORKWEAR, // Sometimes cargo implies workwear style
  "outdoor": Style.OUTDOOR,
  "gorpcore": Style.OUTDOOR,
  "trekking": Style.OUTDOOR,
  "aesthetic": Style.STREETWEAR, // general mapping
};
