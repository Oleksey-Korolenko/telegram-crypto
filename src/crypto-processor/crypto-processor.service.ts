import { request } from 'https';

export default class CryptoProcessorService {
  private baseUrl;

  private apiKey;

  constructor() {
    this.baseUrl = process.env.COIN_MARKET_CAP_BASED_URL;
    this.apiKey = process.env.COIN_MARKET_CAP_API_KEY;
  }

  public testStart = async () => {
    console.log(this.baseUrl, this.apiKey);

    const req = request(
      {
        hostname: this.baseUrl,
        path: '/v1/cryptocurrency/listings/latest?limit=20',
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let body = '';
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
          body += chunk;
        });
        res.on('end', () => {
          console.log('No more data in response.');
          console.log('Finnaly body:', JSON.parse(body));
        });
      }
    );

    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });

    req.end();
  };
}
