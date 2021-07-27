const PageDetail = {
  isTitleFromCollection: false,
  isDescriptionFromCollection: false,
  name: 'Add New Book',
  slug: 'add-new-book',
};

export const pageContent = async (req, res, next) => {
  console.log('PageDetail :>> ', PageDetail);
  try {
    let { protocol, originalUrl, projectLogoKeyName } = req;

    let finalData = {
      fullUrl: `${protocol}://${req.get('host')}${originalUrl}`,
      titleTag: 'Add New Book',
      description: 'Add New Book',
      seoImageToReplace: projectLogoKeyName
        ? `${process.env.S3_BUCKET_URL}/${projectLogoKeyName}`
        : 'https://drapcode.com/img/DrapCode-Icon-Dark.png',
    };

    res.render('add-new-book', finalData);
  } catch (error) {
    console.log('error :>> ', error);
    next(error);
  }
};
