import { useEffect, useState } from 'react';
import {
  Coffee,
  CupSoda,
  EggFried,
  Flame,
  GlassWater,
  Sandwich,
  Soup,
  UtensilsCrossed,
} from 'lucide-react';

interface MenuVisualProps {
  foto: string | null;
  namaMenu: string;
  kategoriId: number | null;
  className?: string;
}

function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
}

function getDefaultMenuPhoto(namaMenu: string, kategoriId: number | null): string {
  const lower = namaMenu.toLowerCase();

  if (kategoriId === 1) {
    if (lower.includes('hitam')) {
      return lower.includes('dingin')
        ? '/src/assets/images/es_kopi_hitam_1795591957707.jpg'
        : '/src/assets/images/menu_kopi_hitam_1795591762549.jpg';
    }
    if (lower.includes('panas')) {
      return '/src/assets/images/kopi_susu_panas_1795591957639.jpg';
    }
    return '/src/assets/images/menu_kopi_susu_1795591763389.jpg';
  }
  if (kategoriId === 2) {
    if (lower.includes('lemon')) {
      return '/src/assets/images/teh_lemon_1795591958432.jpg';
    }
    if (lower.includes('leci')) {
      return '/src/assets/images/teh_leci_1795591958656.jpg';
    }
    if (lower.includes('manis')) {
      return '/src/assets/images/teh_manis_1795591958696.jpg';
    }
    if (lower.includes('uwuh') || lower.includes('wedang')) {
      return '/src/assets/images/wedang_uwuh_1795591959371.jpg';
    }
    return '/src/assets/images/teh_tarik_tunggal_1795592095593.jpg';
  }
  if (kategoriId === 3) {
    if (lower.includes('milo')) {
      return '/src/assets/images/milo_dino_1795591960518.jpg';
    }
    if (lower.includes('cincau')) {
      return '/src/assets/images/cincau_aren_1795591960464.jpg';
    }
    return '/src/assets/images/susu_jahe_1795591960215.jpg';
  }
  if (kategoriId === 4) {
    if (lower.includes('mineral')) {
      return '/src/assets/images/air_mineral_1795591962987.jpg';
    }
    if (lower.includes('badak')) {
      return '/src/assets/images/es_badak_1795591962297.jpg';
    }
    if (lower.includes('soda susu') || lower.includes('extra joss')) {
      return '/src/assets/images/soda_susu_1795592092299.jpg';
    }
    if (lower.includes('kunci') || lower.includes('calamansi')) {
      return '/src/assets/images/jeruk_kunci_1795591961574.jpg';
    }
    return '/src/assets/images/jeruk_manis_1795591961215.jpg';
  }
  if (kategoriId === 5) {
    if (lower.includes('telur')) {
      return '/src/assets/images/telur_setengah_matang_1795592092166.jpg';
    }
    if (lower.includes('singkong')) {
      return '/src/assets/images/singkong_goreng_1795592092993.jpg';
    }
    if (lower.includes('cireng')) {
      return '/src/assets/images/cireng_ayam_1795592092856.jpg';
    }
    if (lower.includes('kentang')) {
      return '/src/assets/images/kentang_goreng_1795592093259.jpg';
    }
    return '/src/assets/images/pisang_goreng_1795591964879.jpg';
  }
  if (kategoriId === 6) {
    if (lower.includes('kukus')) {
      return '/src/assets/images/roti_kukus_1795592045815.jpg';
    }
    return '/src/assets/images/roti_panggang_1795592095231.jpg';
  }
  if (kategoriId === 7) {
    if (lower.includes('nasi')) {
      return '/src/assets/images/nasi_goreng_1795592094330.jpg';
    }
    if (lower.includes('kwetiau')) {
      return '/src/assets/images/kwetiau_goreng_1795592046625.jpg';
    }
    return '/src/assets/images/menu_indomie_warkop_1795591768072.jpg';
  }
  if (lower.includes('soto') || lower.includes('kari') || lower.includes('kuah')) {
    return '/src/assets/images/indomie_kuah_1795592094832.jpg';
  }
  return '/src/assets/images/menu_indomie_warkop_1795591768072.jpg';
}

export function MenuVisual({
  foto,
  namaMenu,
  kategoriId,
  className = 'aspect-[4/3]',
}: MenuVisualProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const resolvedSrc =
    foto && isSafeImageUrl(foto)
      ? foto
      : getDefaultMenuPhoto(namaMenu, kategoriId);

  useEffect(() => {
    setImgFailed(false);
  }, [resolvedSrc]);

  const renderCategoryArtwork = () => {
    switch (kategoriId) {
      case 1:
        return { Icon: Coffee, accent: 'text-[#14532D]', bg: 'bg-[#F3F1EC]', label: 'Racikan Kopi' };
      case 2:
        return { Icon: CupSoda, accent: 'text-[#166534]', bg: 'bg-[#F1F3EE]', label: 'Seduhan Teh' };
      case 3:
        return { Icon: GlassWater, accent: 'text-[#44403C]', bg: 'bg-[#F4F2EE]', label: 'Susu & Cincau' };
      case 4:
        return { Icon: Flame, accent: 'text-[#B45309]', bg: 'bg-[#F6F2EA]', label: 'Jeruk & Soda' };
      case 5:
        return { Icon: EggFried, accent: 'text-[#92400E]', bg: 'bg-[#F5F1EB]', label: 'Camilan Hangat' };
      case 6:
        return { Icon: Sandwich, accent: 'text-[#78350F]', bg: 'bg-[#F4EFE8]', label: 'Roti Panggang & Kukus' };
      case 7:
        return { Icon: UtensilsCrossed, accent: 'text-[#1C1917]', bg: 'bg-[#F0EFEA]', label: 'Hidangan Utama' };
      case 8:
      default:
        return { Icon: Soup, accent: 'text-[#14532D]', bg: 'bg-[#F2F3EE]', label: 'Olahan Mie' };
    }
  };

  if (!imgFailed && resolvedSrc) {
    return (
      <div className={`relative w-full overflow-hidden bg-[#F3F1EC] ${className}`}>
        <img
          key={resolvedSrc}
          src={resolvedSrc}
          alt={namaMenu}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const art = renderCategoryArtwork();
  const Icon = art.Icon;

  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden ${art.bg} ${className}`}
    >
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E6E4DF] bg-white/90 shadow-xs">
          <Icon className={`h-6 w-6 ${art.accent}`} strokeWidth={1.75} />
        </div>
        <span className="text-[11px] font-medium tracking-wide text-[#78716C]">
          {art.label}
        </span>
      </div>
    </div>
  );
}
