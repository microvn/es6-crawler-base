'use strict';
import configs from '../../config';
import logger from '../../library/logger';
import * as helpers from '../../modules/helper/helper';

const success = (_res, _data = {}) => {
  if (!_res) {
    logger.slack({
      _data,
    });
    throw (configs.text.response.notFoundRes);
  }

  const data = {
    meta: {
      status: 200,
      message: 'success',
      total: _data.total,
      limit: _data.limit
    },
    response: _data.data || _data,
  };
  return _res.status(data.meta.status).json(data);
};

const notFound = (_res, _message = configs.text.response.error404) => {
  if (!_res) {
    logger.slack({
      _message,
    });
    throw (configs.text.response.notFoundRes);
  }
  const data = {
    meta: {
      status: 404,
      message: _message,
    },
  };

  return _res.status(data.meta.status).json(data);
};

const serverError = (_res, _message = configs.text.response.error500) => {
  if (!_res) {
    logger.slack({
      _message,
    });
    throw (configs.text.response.notFoundRes);
  }

  if (_message instanceof Error) {
    if (_message.errors) {

      let array = [];
      Object.keys(_message.errors).forEach((key) => {
        array.push(_message.errors[key].message);
      });
      _message = array.join(', ');
    } else {
      _message = helpers.getError(_message);
    }
  }

  logger.slack({
    _message,
  });

  const data = {
    meta: {
      status: 500,
      message: _message,
    },
  };

  return _res.status(data.meta.status).json(data);
};

const clientError = (_res, _message = configs.text.response.error422) => {
  if (!_res) {
    logger.slack({
      _message,
    });
    throw (configs.text.response.notFoundRes);
  }

  const data = {
    meta: {
      status: 422,
      message: _message,
    },
  };
  return _res.status(data.meta.status).json(data);
};


const authenticateError = (_res, _message = configs.text.response.error401) => {
  if (!_res) {
    logger.slack({
      _message,
    });
    throw (configs.text.response.notFoundRes);
  }
  const data = {
    meta: {
      status: 401,
      message: _message,
    },
  };

  return _res.status(data.meta.status).json(data);
};


const forbiddenError = (_res, _message = configs.text.response.error403) => {
  if (!_res) {
    logger.slack({
      _message,
    });
    throw (configs.text.response.notFoundRes);
  }

  logger.slack({
    _message,
  });

  const data = {
    meta: {
      status: 401,
      message: _message,
    },
  };

  return _res.status(data.meta.status).json(data);
};


export { authenticateError, clientError, forbiddenError, notFound, serverError, success };
