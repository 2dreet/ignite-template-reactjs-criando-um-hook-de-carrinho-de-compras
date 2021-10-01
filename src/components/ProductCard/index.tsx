import { Container } from './styles';
import { MdAddShoppingCart } from 'react-icons/md';
import { Product } from '../../models/Product';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product,
  cartAmount: number,
}

export function ProductCard({ product, cartAmount}: ProductCardProps) {

  const { addProduct } = useCart();

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <Container>
        <img src={product.image} alt={product.title} />
        <strong>{product.title}</strong>
        <span>{formatPrice(product.price)}</span>
        <button
          type="button"
          data-testid="add-product-button"
          onClick={() => handleAddProduct(product.id)}
        >
          <div data-testid="cart-product-quantity">
            <MdAddShoppingCart size={16} color="#FFF" />
            {cartAmount}
          </div>
          <span>ADICIONAR AO CARRINHO</span>
        </button>
      </Container>
  );
}