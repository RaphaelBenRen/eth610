/* Crédits des photos (Wikimedia Commons). Les licences CC BY / CC BY-SA exigent d'afficher l'auteur et la licence. */
export type Credit = { author: string; license: string; url: string };

export const IMAGE_CREDITS: Record<string, Credit> = {
  "hero": { author: "BalticServers.com", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:BalticServers_data_center.jpg" },
  "phone": { author: "Jernej Furman from Slovenia", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Hand_holding_smartphone_with_ChatGPT_(52917076309).jpg" },
  "cooling": { author: "Rsparks3", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:Data_center_cooling_tower.jpg" },
  "interview": { author: "Amtec Photos", license: "CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:Young_Man_on_a_Job_Interview_(26931177139).jpg" },
  "padlock": { author: "Lacz02", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Padlock_with_chain.jpg" },
  "money": { author: "Flying Logos", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Over_$1,000,000_dollars_in_USD_$100_bill_stacks.png" },
  "bulb": { author: "Subasis Mahat", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Filament_bulb.jpg" },
  "powerlines": { author: "Radek Kucharski from Warsaw, Poland", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Power_Sunset_(48755830892).jpg" },
  "interview-woman": { author: "amtec_photos", license: "CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:Woman_on_a_Job_Interview_-_38826218972.jpg" },
  "cameras": { author: "Punit Rajpal", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:CCTV_cameras_in_Mumbai.jpg" },
  "gpu": { author: "C. Spille/pcgameshardware.de", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:AMD_Fiji_GPU_package_with_GPU,_HBM_memory_and_interposer.jpg" },
  "servers-corridor": { author: "Christopher Bowns", license: "CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:Virginia_Tech_-_data_center.jpg" },
  "bulbs": { author: "Patrick Tomasso impatrickt", license: "CC0", url: "https://commons.wikimedia.org/wiki/File:Glowing_bulbs_(Unsplash).jpg" },
  "sunset-lines": { author: "\u03a364", license: "CC BY 4.0", url: "https://commons.wikimedia.org/wiki/File:Kashima_Power_Line_07.jpg" },
};
