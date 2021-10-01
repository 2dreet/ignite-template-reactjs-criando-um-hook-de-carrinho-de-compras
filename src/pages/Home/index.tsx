import { useState, useEffect } from 'react';
import { Product } from '../../models/Product';
import { ProductList } from './styles';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<Product[]>([]);
  const { cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    
    if(!sumAmount[product.id]){
      sumAmount[product.id] = 0;
    }

    sumAmount[product.id] += product.amount;

    return sumAmount;
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get('products');
      if(response && response.data) {
        setProducts(response.data);
      } else {
        toast.error('Erro na chamada da API');
      }
    }

    loadProducts();
  }, []);

  return (
    <ProductList>
      {products && products.map(product => 
        <ProductCard key={product.id} product={product} cartAmount={cartItemsAmount[product.id] || 0 } />
      )}
    </ProductList>
  );
};

export default Home;
