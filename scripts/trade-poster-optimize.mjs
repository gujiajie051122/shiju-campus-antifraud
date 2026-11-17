import sharp from 'sharp';await sharp('docs/course-sources/trade.jpg').resize({width:800,withoutEnlargement:true}).webp({quality:88}).toFile('public/course-posters/trade.webp');
