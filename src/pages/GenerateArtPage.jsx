import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { Card, Row, Col } from 'react-bootstrap';
import Button from '../components/common/Button';
import { Download, ArrowLeft } from 'lucide-react';

const GenerateArtPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const artRef = useRef(null);
  const product = state?.product;

  if (!product) return <Navigate to="/inventory" />;

  const handleDownload = () => {
    toPng(artRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `CricasTech-${product.name}.png`;
        link.href = dataUrl;
        link.click();
      });
  };

  const margin = (((product.expected_price - product.cost_price) / product.cost_price) * 100).toFixed(1);

  return (
    <div className="container py-4">
      <Button variant="link" onClick={() => navigate('/inventory')} className="mb-3 p-0"><ArrowLeft /> Voltar</Button>
      
      <Row className="justify-content-center">
        <Col md={6}>
          <div ref={artRef} className="cricas-art-container" style={{
            background: 'linear-gradient(135deg, #001f3f 0%, #003366 100%)',
            color: 'white', padding: '50px', borderRadius: '20px', textAlign: 'center', width: '500px', height: '500px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <h5 style={{ color: '#00d4ff', letterSpacing: '2px' }}>CRICASTECH</h5>
            <h1 className="my-4" style={{ fontWeight: '800' }}>{product.name}</h1>
            <div className="my-4">
              <p className="mb-0 text-muted">POR APENAS</p>
              <h2 style={{ color: '#FFD700', fontSize: '4rem', fontWeight: '900' }}>
                R$ {product.expected_price}
              </h2>
            </div>
            <div className="mt-4 p-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <span className="fw-bold">Margem de Lucro: {margin}%</span>
            </div>
          </div>
          <Button onClick={handleDownload} className="w-100 mt-4" icon={<Download />}>Baixar Arte PNG</Button>
        </Col>
      </Row>
    </div>
  );
};

export default GenerateArtPage;