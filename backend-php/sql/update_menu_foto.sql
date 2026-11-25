-- Mengisi kolom `foto` sesuai jenis hidangan/minuman untuk seluruh 60 item pada tabel `menu` di database `sejati_maps`
-- Jalankan query ini di phpMyAdmin apabila ingin menyimpan path foto langsung di MySQL

UPDATE `menu` SET `foto` = '/src/assets/images/menu_kopi_hitam_1795591762549.jpg' WHERE `id` = 1;
UPDATE `menu` SET `foto` = '/src/assets/images/es_kopi_hitam_1795591957707.jpg' WHERE `id` = 2;
UPDATE `menu` SET `foto` = '/src/assets/images/kopi_susu_panas_1795591957639.jpg' WHERE `id` IN (3, 5, 7);
UPDATE `menu` SET `foto` = '/src/assets/images/menu_kopi_susu_1795591763389.jpg' WHERE `id` IN (4, 6, 8, 9);

UPDATE `menu` SET `foto` = '/src/assets/images/teh_tarik_tunggal_1795592095593.jpg' WHERE `id` IN (10, 11);
UPDATE `menu` SET `foto` = '/src/assets/images/teh_lemon_1795591958432.jpg' WHERE `id` IN (12, 13);
UPDATE `menu` SET `foto` = '/src/assets/images/teh_leci_1795591958656.jpg' WHERE `id` IN (14, 15);
UPDATE `menu` SET `foto` = '/src/assets/images/teh_manis_1795591958696.jpg' WHERE `id` IN (16, 17);
UPDATE `menu` SET `foto` = '/src/assets/images/wedang_uwuh_1795591959371.jpg' WHERE `id` = 18;

UPDATE `menu` SET `foto` = '/src/assets/images/susu_jahe_1795591960215.jpg' WHERE `id` IN (19, 20, 21);
UPDATE `menu` SET `foto` = '/src/assets/images/milo_dino_1795591960518.jpg' WHERE `id` IN (22, 23);
UPDATE `menu` SET `foto` = '/src/assets/images/cincau_aren_1795591960464.jpg' WHERE `id` = 24;

UPDATE `menu` SET `foto` = '/src/assets/images/jeruk_manis_1795591961215.jpg' WHERE `id` BETWEEN 25 AND 28;
UPDATE `menu` SET `foto` = '/src/assets/images/jeruk_kunci_1795591961574.jpg' WHERE `id` BETWEEN 29 AND 32;
UPDATE `menu` SET `foto` = '/src/assets/images/soda_susu_1795592092299.jpg' WHERE `id` IN (33, 34);
UPDATE `menu` SET `foto` = '/src/assets/images/es_badak_1795591962297.jpg' WHERE `id` IN (35, 36);
UPDATE `menu` SET `foto` = '/src/assets/images/air_mineral_1795591962987.jpg' WHERE `id` = 37;

UPDATE `menu` SET `foto` = '/src/assets/images/telur_setengah_matang_1795592092166.jpg' WHERE `id` = 38;
UPDATE `menu` SET `foto` = '/src/assets/images/singkong_goreng_1795592092993.jpg' WHERE `id` = 39;
UPDATE `menu` SET `foto` = '/src/assets/images/cireng_ayam_1795592092856.jpg' WHERE `id` = 40;
UPDATE `menu` SET `foto` = '/src/assets/images/kentang_goreng_1795592093259.jpg' WHERE `id` = 41;
UPDATE `menu` SET `foto` = '/src/assets/images/pisang_goreng_1795591964879.jpg' WHERE `id` IN (42, 43);

UPDATE `menu` SET `foto` = '/src/assets/images/roti_panggang_1795592095231.jpg' WHERE `id` BETWEEN 44 AND 47;
UPDATE `menu` SET `foto` = '/src/assets/images/roti_kukus_1795592045815.jpg' WHERE `id` BETWEEN 48 AND 50;

UPDATE `menu` SET `foto` = '/src/assets/images/nasi_goreng_1795592094330.jpg' WHERE `id` = 51;
UPDATE `menu` SET `foto` = '/src/assets/images/kwetiau_goreng_1795592046625.jpg' WHERE `id` = 52;
UPDATE `menu` SET `foto` = '/src/assets/images/menu_indomie_warkop_1795591768072.jpg' WHERE `id` BETWEEN 53 AND 56;
UPDATE `menu` SET `foto` = '/src/assets/images/indomie_kuah_1795592094832.jpg' WHERE `id` BETWEEN 57 AND 60;

