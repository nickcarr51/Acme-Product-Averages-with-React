import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Switch, Link, Route, Redirect } from "react-router-dom";

const { Component } = React;
const { render } = ReactDOM;

const app = document.querySelector('#app');

class Home extends Component {

    ProductAverage = () => {
        const { products } = this.props;
        if (products.length > 0) {
            return <span>${ (products.reduce((a, b) => {return a + b.suggestedPrice}, 0) / products.length).toFixed(2) }</span>
        } else {
            return null;
        }
    }

    render() {
        const { products } = this.props;
        const { ProductAverage } = this;
        return (
            <div className='jumbotron page'>
                <h1 className='display-4'>Welcome to Acme</h1>
                 <p className='lead'>We have { products.length } products with an average price of { <ProductAverage /> }</p>
                <hr className='my-4'></hr>
                <Link className='exploreButton' to='/products'>Explore Our Products</Link>
            </div>
        )
    }
}

class Products extends Component {

    ProductCards = () => {
        const { products, companies, offerings } = this.props;
        return products.map(prod => {
            const prodOfferings = offerings.filter(offer => prod.id === offer.productId);
            const lowestPrice = (Math.min(...prodOfferings.map(prod => prod.price)));
            const lowestOffersIds = prodOfferings.filter(offer => offer.price === lowestPrice).map(offer => offer.companyId);
            const prodAverage = (prodOfferings.reduce((a, b) => {return a + b.price},0) / prodOfferings.length).toFixed(2);
            let match = 0;
            return (
                <div key={ prod.id } className='productStyle'>
                    <span><strong>Product:</strong> { prod.name }</span>
                    <span><strong>Suggested Price: </strong>${ prod.suggestedPrice }.00</span>
                    <span><strong>Average Price: </strong>${ prodAverage }</span>
                    <span><strong>Lowest Price: </strong>${ lowestPrice.toFixed(2) }<strong> Offered By: </strong>{
                        lowestOffersIds.length > 1 ?
                        companies.map((company, idx) => {
                            if (lowestOffersIds.includes(company.id)) {
                                match++
                            }
                            if (lowestOffersIds.includes(company.id)) {
                                if (match < lowestOffersIds.length) {
                                    return <span key={ company.id }>{ company.name }, </span>
                                } else {
                                    match = 0;
                                    return <span key={ company.id }> and { company.name }</span>
                                }
                            }
                        }) :
                        <span> { companies.find(comp => lowestOffersIds.includes(comp.id)).name }</span>
                    }</span>
                </div>
            )
        })
    }

    render() {
        const { ProductCards } = this;
        return (
            <div className='page' style={{display:'flex', flexDirection:'column'}}>
                    <ProductCards />
            </div>
        );
    }
}

const Nav = (params) => {
    return (
        <nav className='navBar container'>
                <Link className='navTab' to='/'>Home</Link>
                <Link className='navTab' to='/products'>Products</Link>
        </nav>
    );
}

class App extends Component {

    state = {
        products: [],
        companies: [],
        offerings: [],
    }

    componentDidMount() {
        const productData = fetch(`https://acme-users-api-rev.herokuapp.com/api/products`).then(res => res.json());
        const companyData = fetch(`https://acme-users-api-rev.herokuapp.com/api/companies`).then(res => res.json());
        const offeringData = fetch(`https://acme-users-api-rev.herokuapp.com/api/offerings`).then(res => res.json());

        Promise.all([productData, companyData, offeringData])
        .then(res => {
            this.setState({
                products: res[0],
                companies: res[1],
                offerings: res[2],
            })
            // console.log(this.state)
        })
    }


    render() {
        const { products, companies, offerings } = this.state;
        return (
            <div className='container'>
                <HashRouter>
                    <div className='fixed-top container'>
                        <Route render={ (params) => <Nav params={ params }/> } />
                        <hr />
                    </div>
                    <Switch>
                            <Route exact path='/' render={ () => <Home products={ products }/>} />
                            <Route path='/products' render={ () => <Products products={ products } companies={ companies } offerings={ offerings }/>} />
                            <Redirect to='/' />
                    </Switch>
                </HashRouter>

            </div>
        )
    }
}

render(
    <App />,
    app,
)