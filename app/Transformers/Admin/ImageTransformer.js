'use strict';

const BumblebeeTransformer = use('Bumblebee/Transformer');
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer');

/**
 * ImageTransformer class
 *
 * @class ImageTransformer
 * @constructor
 */
class ImageTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  transform(image) {
    // toJSON
    image = image.toJSON();
    return {
      // add your transformation object here
      id: image.id,
      url: image.url,
      size: image.size,
      original_name: image.original_name,
      extension: image.extension,
    };
  }
}

module.exports = ImageTransformer;
