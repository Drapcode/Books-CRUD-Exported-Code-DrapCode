const PageDetail = {
  isTitleFromCollection: false,
  isDescriptionFromCollection: false,
  name: '404',
  slug: '404',
};

export const pageContent = async (req, res, next) => {
  try {
    let { protocol, originalUrl, projectLogoKeyName } = req;
    console.log('PageDetail :>> ', PageDetail);
    let finalData = {
      fullUrl: `${protocol}://${req.get('host')}${originalUrl}`,
      titleTag: 'Page not found',
      description: '404',
      seoImageToReplace: projectLogoKeyName
        ? `${process.env.S3_BUCKET_URL}/${projectLogoKeyName}`
        : 'https://drapcode.com/img/DrapCode-Icon-Dark.png',
    };

    res.render('404', finalData);
  } catch (error) {
    console.log('error :>> ', error);
    next(error);
  }
};
