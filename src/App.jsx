import React, { useEffect, useState } from 'react';
import HeaderLogo from './components/Header/HeaderLogo.jsx';
import AcaiModal from './components/Body/Modal.jsx'; // Seu Modal.jsx
import CakeModal from './components/Body/CakeModal.jsx'; // Novo modal de bolo
import Footer from './components/Footer/Footer.jsx';
import CheckoutForm from './components/Checkout/CheckoutForm.jsx';
import Download from './components/Download/Download.jsx';
import styled, { createGlobalStyle } from 'styled-components';
import acaiimg2 from './assets/acai2.jpeg';
import acaiimg3 from './assets/acai3.jpeg';
import acaiimg4 from './assets/acai4.jpeg';
import acaiimg5 from './assets/acai5.jpeg';
import barca from './assets/barca.jpeg';
import litro from './assets/litro.jpeg';
import cakeImage from './assets/cake_generic.jpeg'; 

// Importações do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- LISTA DE PRODUTOS ---
const ACAL_OPTIONS = [
    { type: '300ml', title: 'Açaí - 300 ml', price: 14.00, image: acaiimg3 },
    { type: '400ml', title: 'Açaí - 400 ml', price: 16.00, image: acaiimg2 },
    { type: '500ml', title: 'Açaí - 500 ml', price: 18.00, image: acaiimg4 },
    { type: '700ml', title: 'Açaí - 700 ml', price: 23.00, image: acaiimg5 },
    { type: '1L', title: 'Açaí - 1 Litro', price: 40.00, image: litro },
    { type: 'Barca 550ml', title: 'Barca 550ml', price: 25.00, image: barca },
];

const CAKE_OPTIONS = [
    { id: 'bolo1', titulo: 'Bolo de Cenoura com Brigadeiro', descricao: 'Massa fofinha de cenoura com uma generosa cobertura de brigadeiro. Serve até 3 pessoas (aprox. 800g)', preco: 23.90, image: 'cakeImage', type: 'Bolo' },
    { id: 'bolo2', titulo: 'Bolo Sensação', descricao: 'Delicioso bolo de chocolate com cobertura de brigadeiro e pedaços de morango.', preco: 24.90, image: 'cakeImage', type: 'Bolo' },
    { id: 'bolo3', titulo: 'Bolo de Ninho com Morango', descricao: 'Nosso bolo vulcão artesanal é composto de massa de chocolate. Serve até 3 pessoas (aprox. 700g)', preco: 27.90, image: 'cakeImage', type: 'Bolo' },
    { id: 'bolo4', titulo: 'Bolo de Ninho com Nutella', descricao: 'Massa super fofinha de chocolate com cobertura cremosa de Ninho com Nutella.', preco: 29.90, image: 'cakeImage', type: 'Bolo' },
];
// -----------------------------

export default function App() {
 // Variáveis globais do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDvJcPc0Z3chL_JsLucYg7-li1B2d2lxTs",
    authDomain: "acaidowagaobsb.firebaseapp.com",
    projectId: "acaidowagaobsb",
    storageBucket: "acaidowagaobsb.firebasestorage.app",
    messagingSenderId: "761926054075",
    appId: "1:761926054075:web:c04dd9aa43ead362d6b99e"
  };
    const appId = firebaseConfig.appId;
    
    // Estados da aplicação
    const [selectedTab, setSelectedTab] = useState('Açaí do Wagão'); // NOVO: Estado para a aba
    const [isAcaiModalOpen, setIsAcaiModalOpen] = useState(false);
    const [isCakeModalOpen, setIsCakeModalOpen] = useState(false); // NOVO: Estado para o modal de bolo
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedAcai, setSelectedAcai] = useState(null);
    const [selectedCake, setSelectedCake] = useState(null); // NOVO: Estado para o bolo selecionado
    const [selectedOptions, setSelectedOptions] = useState({
        creme: null,
        frutas: [],
        complementos: [],
        adicionais: [],
        caldas: null
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [pedidos, setPedidos] = useState([]);
    const { pathname, search } = window.location;
    const isDownloadPage = pathname === '/download' || search.includes('download=');

    // Estados do Firebase
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Inicialização do Firebase e autenticação (MANTIDO)
    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                await signInAnonymously(firebaseAuth);
            }
            setIsAuthReady(true);
        });

        return () => unsubscribe();
    }, [firebaseConfig]); 

    // --- FUNÇÕES DE MANIPULAÇÃO DE PEDIDOS DE AÇAÍ ---
    // A função handleSelectAcaiOptions deve ser atualizada para usar a nova estrutura de pedido
    const handleSelectAcaiOptions = (options, newAcaiPrice) => {
        const novoPedido = {
            tamanho: selectedAcai,
            ...options,
            preco: newAcaiPrice, // O preço calculado no Modal.jsx é usado
            tipoProduto: 'Açaí' // Novo campo para diferenciar
        };

        setPedidos(prevPedidos => {
            const novosPedidos = [...prevPedidos, novoPedido];
            const novoTotal = novosPedidos.reduce((total, pedido) => total + pedido.preco, 0);
            setTotalPrice(novoTotal);
            return novosPedidos;
        });
        
        handleCloseAcaiModal();
    };

    const handleOpenAcaiModal = (acaiType) => {
        setSelectedAcai(acaiType);
        // Resetar opções para o novo açaí
        setSelectedOptions({
            creme: null,
            frutas: [],
            complementos: [],
            adicionais: [],
            caldas: null
        });
        setIsAcaiModalOpen(true);
    };

    const handleCloseAcaiModal = () => {
        setIsAcaiModalOpen(false);
    };

    // --- FUNÇÕES DE MANIPULAÇÃO DE PEDIDOS DE BOLO ---
    const handleOpenCakeModal = (cake) => {
        setSelectedCake(cake);
        setIsCakeModalOpen(true);
    };

    const handleCloseCakeModal = () => {
        setIsCakeModalOpen(false);
        setSelectedCake(null); // Limpar o bolo selecionado ao fechar
    };

    const handleSelectCake = (cake, quantity) => {
        const novosPedidos = [];
        // Adiciona um pedido por item, para que possam ser removidos individualmente no futuro
        for (let i = 0; i < quantity; i++) {
             novosPedidos.push({
                tamanho: cake.titulo, // Usa o título como "tamanho" para o bolo
                preco: cake.preco,
                tipoProduto: 'Bolo',
                // Zera as outras opções para o bolo (importante para o CheckoutForm)
                creme: null, frutas: [], complementos: [], adicionais: [], caldas: null 
            });
        }
        
        setPedidos(prevPedidos => {
            const pedidosAtualizados = [...prevPedidos, ...novosPedidos];
            const novoTotal = pedidosAtualizados.reduce((total, pedido) => total + pedido.preco, 0);
            setTotalPrice(novoTotal);
            return pedidosAtualizados;
        });

        setSelectedCake(null); // Limpar após adicionar ao pedido
    };
    // ----------------------------------------------------

    // --- LÓGICA DE CHECKOUT E RESET (MANTIDA) ---
    const handleFecharPedido = () => {
        if (pedidos.length === 0) return;
        setIsCheckoutOpen(true);
    };

    const handleBackFromCheckout = () => {
        setIsCheckoutOpen(false);
    };

    const resetPedido = () => {
        setSelectedAcai(null);
        setSelectedCake(null);
        setSelectedOptions({
            creme: null,
            frutas: [],
            complementos: [],
            adicionais: [],
            caldas: null
        });
        setPedidos([]);
        setTotalPrice(0);
        setIsCheckoutOpen(false);
    };

    const handleClearOrder = () => {
        resetPedido();
    };

    const handleConfirmCheckout = async () => {
        // Lógica de checkout é feita no CheckoutForm, aqui apenas reseta o estado
        resetPedido();
    };

    useEffect(() => {
        const isAnyModalOpen = isAcaiModalOpen || isCakeModalOpen;
        if (isAnyModalOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isAcaiModalOpen, isCakeModalOpen]);


    // Renderização do Cardápio de Açaí (Ajustado para o novo grid)
    const renderAcaiMenu = () => (
        <AcaiOptionGrid>
            {ACAL_OPTIONS.map((item) => (
                <AcaiOptionContainer key={item.type} onClick={() => handleOpenAcaiModal(item.type)}>
                    <AcaiInfo>
                        <AcaiTitle>{item.title}</AcaiTitle>
                        <AcaiPrice>R$ {item.price.toFixed(2)}</AcaiPrice>
                    </AcaiInfo>
                    <AcaiImage src={item.image} alt={item.title} />
                </AcaiOptionContainer>
            ))}
        </AcaiOptionGrid>
    );

    // Renderização do Cardápio de Bolos Vulcões (NOVO)
    const renderCakeMenu = () => (
        <CakeMenuContainer>
            {CAKE_OPTIONS.map((cake) => (
                <CakeItemContainer key={cake.id} onClick={() => handleOpenCakeModal(cake)}>
                    <CakeTextContent>
                        <CakeTitle>{cake.titulo}</CakeTitle>
                        <CakeDescription>{cake.descricao}</CakeDescription>
                        <CakePrice>R$ {cake.preco.toFixed(2)}</CakePrice>
                    </CakeTextContent>
                    {/* Usando a imagem genérica importada */}
                    <CakeImageItem src={cakeImage} alt={cake.titulo} /> 
                </CakeItemContainer>
            ))}
        </CakeMenuContainer>
    );
    const scrollToSection = (id) => {
        // 1. Encontrar o elemento pelo ID
        const section = document.getElementById(id);
        if (section) {
            // 2. Rolar para a seção com animação suave
            section.scrollIntoView({
                behavior: 'smooth', 
                block: 'start'      
            });
        }
        if (id === 'acai-section') {
            setSelectedTab('Açaí do Wagão');
        } else if (id === 'bolos-section') {
            setSelectedTab('Bolos Vulcões');
        }
    };
    //const menuContent = selectedTab === 'Açaí do Wagão' ? renderAcaiMenu() : renderCakeMenu();

    return (
        <>
            <GlobalStyle />
            {/* NOVO: HeaderContainer fixo com a Logo e a TabBar */}
            <HeaderContainer>
                <HeaderLogo />
                <TabBar>
                    <TabButton 
                        active={selectedTab === 'Açaí do Wagão'} 
                        onClick={() => scrollToSection('acai-section')}
                    >
                        Açaí do Wagão
                    </TabButton>
                    <TabButton 
                        active={selectedTab === 'Bolos Vulcões'} 
                        onClick={() => scrollToSection('bolos-section')}
                    >
                        Bolos Vulcões
                    </TabButton>
                </TabBar>
            </HeaderContainer>

            {isDownloadPage ? (
                <Download db={db} userId={userId} appId={appId} />
            ) : (
                <>
                    <Content>
                        <SectionContainer id="acai-section">
                            {renderAcaiMenu()}
                        </SectionContainer>
                        <SectionContainer id="bolos-section">
                            {renderCakeMenu()}
                        </SectionContainer>
                    </Content>

                    {/* Modal de Açaí (Seu Modal.jsx) */}
                    <AcaiModal
                        isOpen={isAcaiModalOpen}
                        onClose={handleCloseAcaiModal}
                        onSelectOptions={handleSelectAcaiOptions}
                        selectedAcai={selectedAcai}
                        selectedOptions={selectedOptions}
                        setSelectedOptions={setSelectedOptions}
                        // updateTotalPrice e totalPrice não são mais necessários aqui (o cálculo é interno ao modal e o resultado é passado via onSelectOptions)
                    />

                    {/* Modal de Bolo (NOVO) */}
                    <CakeModal
                        isOpen={isCakeModalOpen}
                        onClose={handleCloseCakeModal}
                        onSelectCake={handleSelectCake}
                        cake={selectedCake}
                    />

                    {isCheckoutOpen && (
                        <CheckoutForm
                            pedidos={pedidos}
                            totalPrice={totalPrice}
                            onConfirm={handleConfirmCheckout}
                            onBack={handleBackFromCheckout}
                            db={db}
                            userId={userId}
                            appId={appId}
                        />
                    )}
                    {!isAcaiModalOpen && !isCakeModalOpen && !isCheckoutOpen && (
                        <Footer
                            totalPrice={totalPrice}
                            fecharPedido={handleFecharPedido}
                            disabled={pedidos.length === 0}
                            onClearOrder={handleClearOrder}
                        />
                    )}
                </>
            )}
        </>
    );
}

// Estilos globais
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  
  body {
    font-family: 'Poppins', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    &.modal-open {
      overflow: hidden;
    }
  }
`;

// Estilos dos componentes principais
const HeaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  /* Altura da Logo (150px desktop / 120px mobile) + Altura da TabBar (aprox 50px) */
`;

const TabBar = styled.div`
    display: flex;
    overflow-x: auto;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    border-bottom: 1px solid #ddd;
    /* Para fixar a barra abaixo do HeaderLogo */
    position: fixed;
    width: 100%; 
    left: 0;
    top: 150px; /* Altura do LogoWrapper desktop */
    z-index: 998;
    
    @media screen and (max-width: 768px) {
        top: 120px; /* Altura do LogoWrapper mobile */
    }
`;

const TabButton = styled.button`
    padding: 15px 20px;
    border: none;
    background: white;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: ${({ active }) => (active ? '#8E44AD' : '#555')};
    border-bottom: 3px solid ${({ active }) => (active ? '#8E44AD' : 'transparent')};
    transition: all 0.3s;
    flex-shrink: 0;

    &:hover {
        color: #8E44AD;
    }
`;


const Content = styled.div`
  /* Ajuste o padding-top para a soma da altura da Logo e da TabBar */
  padding-top: 215px; /* Altura do HeaderLogo (150px) + TabBar (aprox 50px) + margem */
  padding-bottom: 120px;

  @media screen and (max-width: 768px) {
    padding-top: 175px; /* Altura ajustada: Logo (120px) + TabBar (aprox 50px) + margem */
    padding-bottom: 150px;
  }
`;

const AcaiOptionGrid = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 0 20px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 0 15px;
    width: 100%;
    box-sizing: border-box;
  }
`;

const AcaiOptionContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  align-items: center;
  width: calc(50% - 10px); 
  margin-bottom: 20px;
  box-sizing: border-box;
  cursor: pointer;

  @media screen and (max-width: 768px) {
    width: 100%;
    margin: 0 auto 15px;
    flex-direction: row; 
    justify-content: space-between;
    padding: 15px;
  }
`;

const AcaiInfo = styled.div`
  flex: 1;
`;

const AcaiTitle = styled.h2`
  margin: 0 0 10px;
  font-size: 1.3rem;

  @media screen and (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const AcaiPrice = styled.p`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const AcaiImage = styled.img`
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  margin-left: 20px;

  @media screen and (max-width: 768px) {
    width: 80px;
    height: 80px;
    margin-left: 10px;
  }
`;

// --- NOVOS ESTILOS PARA BOLOS (similar ao AcaiOptionContainer para manter consistência visual) ---
const CakeMenuContainer = styled.div`
    padding: 20px;

    @media screen and (max-width: 768px) {
        padding: 15px;
    }
`;

const CakeItemContainer = styled.div`
    display: flex;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin-bottom: 15px;
    cursor: pointer;
    align-items: flex-start;
    justify-content: space-between;

    &:hover {
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
`;

const CakeTextContent = styled.div`
    flex: 1;
    padding-right: 10px;
`;

const CakeTitle = styled.h3`
    margin-top: 0;
    margin-bottom: 5px;
    font-size: 1.2rem;
`;

const CakeDescription = styled.p`
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 10px;
    line-height: 1.4;
`;

const CakePrice = styled.p`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0;
`;

const CakeImageItem = styled.img`
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;

    @media screen and (max-width: 768px) {
        width: 80px;
        height: 80px;
    }
`;
const SectionContainer = styled.div`
  /* Apenas um wrapper para dar o ID */
  padding-bottom: 30px; /* Espaçamento entre as seções se necessário */
`;