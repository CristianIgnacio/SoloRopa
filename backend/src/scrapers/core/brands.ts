import { Freshbrand } from "../brands/freshbrand";
import { Moreamor } from "../brands/moreamor";
import { Rudeboys } from "../brands/rudeboys";
import { Subcomplot } from "../brands/subcomplot"
import { BelowApparel } from "../brands/belowapparel"
import { Bvnggvng } from "../brands/bvnggvng"
import { MDF } from "../brands/mdf"
import { Treinoficial } from "../brands/treinoficial"
import { Whatup } from "../brands/whatup"

const stores: { [key: string]: any } = {
  freshbrand: Freshbrand,
  moreamor : Moreamor,
  rudeboys : Rudeboys,
  subcomplot : Subcomplot,
  belowapparel : BelowApparel,
  bvnggvng : Bvnggvng,
  mdf : MDF,
  treinoficial: Treinoficial,
  whatup: Whatup
};

export default stores