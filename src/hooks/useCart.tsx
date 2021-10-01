import { useEffect } from 'react';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
       return JSON.parse(storagedCart);
    }

    return [];
  });

  const updateCart = (cartToSave: Product[]): void => {
    setCart(cartToSave);
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartToSave));
  };

  const getProductStock = async (productId: number): Promise<number> => {
    const response = await api.get<Stock>(`stock/${productId}`);
    if(response && response.data) {
        return response.data.amount;
    } 
    throw new Error();
  }

  const addProduct = async (productId: number) => {
    try {
        const product = cart.find(product => product.id === productId);
        if(!product) {
          const stock = await getProductStock(productId);
          if(stock && stock > 0){
            const response = await api.get(`products/${productId}`);
            if(response && response.data) {
              updateCart([...cart, {...response.data, amount: 1}]);
            } else {
              throw new Error();
            }
          }
        } else {
          await updateProductAmount({productId, amount: product.amount + 1});
        }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const product = cart.find(product => product.id === productId);
      if(product) { 
        updateCart([...cart.filter(product => product.id !== productId)]);
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const stock = await getProductStock(productId);
      if(stock >= amount) {
         if(amount > 0) {
          const product = cart.find(product => product.id === productId);
          if(product) {
            product.amount = amount;
          }
          updateCart([...cart]);
         }
      } else {
        toast.error('Quantidade solicitada fora de estoque');
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
