'use strict';

const crypto = use('crypto');
const Helpers = use('Helpers');

/**
 * Generate random string
 *
 * @param {int} length - O tamanho da string gerada
 * @return { string } uma string randômica do tamanho do length
 */

const str_random = async (length = 40) => {
  let string = '';
  let len = string.length;

  if (len < length) {
    let size = length - len;
    let bytes = await crypto.randomBytes(size);
    let buffer = Buffer.from(bytes);
    string += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, size);
  }

  return string;
};

/**
 * Move single file to the specified path, if none is specified,
 * then public/uploads will be used
 * @param { FileJar } file - o arquivo a ser gerenciado
 * @param {string} path - o caminho para onde o arquivo será movido
 *  @return {Object<FileJar>}
 */

const manage_single_upload = async (file, path = null) => {
  path = path ? path : Helpers.publicPath('uploads');
  // Gera um nome aleatório
  const random_name = await str_random(30);

  let filename = `${new Date().getTime()}-${random_name}.${file.subtype}`;

  // Renomeia o arquivo e o move para path
  await file.move(path, {
    name: filename,
  });

  return file;
};

/**
 * Move multipler files for a specified path
 * if none is specified, then public/uploads will be used
 * @param { FileJar } fileJar
 * @param { string } path
 * @return { Object }
 */

const manage_multiple_uploads = async (fileJar, path = null) => {
  path = path ? path : Helpers.publicPath('uploads');
  let successes = [],
    errors = [];

  await Promise.all(
    fileJar.files.map(async file => {
      let random_name = await str_random(30);
      let filename = `${new Date().getTime()}-${random_name}.${file.subType}`;

      //move o arquivo
      await file.move(path, {
        name: filename,
      });

      // Verificamos se realmente moveu
      if (file.moved()) {
        successes.push(file);
      } else {
        errors.push(file.error());
      }
    })
  );

  return { successes, errors };
};

module.exports = {
  str_random,
};
