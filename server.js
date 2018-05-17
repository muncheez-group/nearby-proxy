const axios = require('axios');
const express = require('express')
const morgan = require('morgan');
const path = require('path');
const app = express();
const port = 3000;

app.use(morgan('dev'));

const clientBundles = './public/services';
const serverBundles = './templates/services';
const serviceConfig = require('./service-config.json');
const services = require('./loader.js')(clientBundles, serverBundles, serviceConfig);

const React = require('react');
const ReactDom = require('react-dom/server');
const Layout = require('./templates/layout');
const App = require('./templates/app');
const Scripts = require('./templates/scripts');

const renderComponents = (components, props) => {
  return Object.keys(components).map(item => {
    console.log('comp: ' , components);
    console.log('props: ' , props);
    let component = React.createElement(components[item], props);
    console.log('return :', ReactDom.renderToString(component));
    return ReactDom.renderToString(component);
  });
};

app.use('/', express.static(path.join(__dirname, './public')));

app.get('/restaurants/:id', function(req, res) {
  let id = req.params.id;
  axios.get(`http://localhost:3004/api/restaurants/${id}/nearby`)
    .then(({data}) => {
      let obj = {
        currentRestaurant: data[0],
        nearbyRestaurants: data[1]
      }
      console.log('aasdfasdfasdfsa', obj.currentRestaurant);
      console.log('axxxxxxxxxxxxxxxxxxxx', obj.nearbyRestaurants);
      console.log('dsaaafasdfasdf',services);
      let components = renderComponents(services, obj);
      res.end(Layout(
        'Nearby',
        App(...components),
        Scripts(Object.keys(services), obj)
      ));
    })
    .catch((error) => {
      console.log('error: ', error)
    })
});

app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
});