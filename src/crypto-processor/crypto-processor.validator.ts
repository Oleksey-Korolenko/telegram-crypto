import _ from 'lodash';

const cryptoProcessorFields = ['language', 'mimetype', 'count'];

class CryptoProcessorValidate {
  testStart = (payload: any) => {
    return _.pick(payload, cryptoProcessorFields);
  };
}

export default {
  cryptoProcessorValidate: new CryptoProcessorValidate(),
  CryptoProcessorValidate,
  cryptoProcessorFields,
};
