// import * as React from 'react';
// import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
// import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
// import type {IconButtonProps} from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import{ useState } from 'react';
import { Box } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

import type { Product } from '../Types/Types';

// interface ExpandMoreProps extends IconButtonProps {
//   expand: boolean;
// }

// const ExpandMore = styled((props: ExpandMoreProps) => {
//   const { expand, ...other } = props;
//   return <IconButton {...other} />;
// })(({ theme }) => ({
//   marginLeft: 'auto',
//   transition: theme.transitions.create('transform', {
//     duration: theme.transitions.duration.shortest,
//   }),
//   variants: [
//     {
//       props: ({ expand }) => !expand,
//       style: {
//         transform: 'rotate(0deg)',
//       },
//     },
//     {
//       props: ({ expand }) => !!expand,
//       style: {
//         transform: 'rotate(180deg)',
//       },
//     },
//   ],
// }));

interface propsCard {
  product : Product
}

const RecipeReviewCard = (props : propsCard) => {
  const {brand, images, title, price} = props.product
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          <Avatar src={brand.logo?.src ?? ""} alt={brand.name} sx={{ bgcolor: brand.logo?.backgroundColor }} aria-label="recipe"/>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={brand.name}
        subheader="September 14, 2016"
      />
      {/* <CardMedia
        component="img"
        height="400"
        image={images[0].src ?? ""}
        alt={images[0].alt ?? title}
      /> */}
      <>
        <Box sx={{ position: "relative", width: "100%", height: 400 }}>
        <img
          src={images[index].src ?? ""}
          alt={images[index].alt ?? title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 8,
          }}
        />

        {images.length > 1 && (
          <>
          {/* Botón izquierda */}
          <IconButton
            onClick={prev}
            sx={{ position: "absolute", top: "50%", left: 5, transform: "translateY(-50%)" }}
          >
            <ArrowBackIos />
          </IconButton>

          {/* Botón derecha */}
          <IconButton
            onClick={next}
            sx={{
              position: "absolute",
              top: "50%",
              right: 5,
              transform: "translateY(-50%)",
            }}
          >
            <ArrowForwardIos />
          </IconButton>
          </>
        )}
      </Box>
      </>
      <CardContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </Typography>
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          ${price}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default RecipeReviewCard