const PageDetail = {
  isTitleFromCollection: false,
  isDescriptionFromCollection: false,
  slug: 'home',
  name: 'Home',
};

export const pageContent = async (req, res, next) => {
  console.log('PageDetail :>> ', PageDetail);
  try {
    let { protocol, originalUrl, projectLogoKeyName } = req;

    let finalData = {
      fullUrl: `${protocol}://${req.get('host')}${originalUrl}`,
      titleTag: 'Home',
      description: 'Home',
      seoImageToReplace: projectLogoKeyName
        ? `${process.env.S3_BUCKET_URL}/${projectLogoKeyName}`
        : 'https://drapcode.com/img/DrapCode-Icon-Dark.png',
    };

    res.render('home', finalData);
  } catch (error) {
    console.log('error :>> ', error);
    next(error);
  }
};
