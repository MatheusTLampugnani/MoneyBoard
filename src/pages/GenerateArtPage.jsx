import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Spinner } from 'react-bootstrap';
import { Palette, Sparkles, Rocket, ArrowLeft, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import './ArtGeneration.css';

const GenerateArtPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const product = location.state?.product;

  const [prompt, setPrompt] = useState('');
  const [artStyle, setArtStyle] = useState('Realista');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);

  useEffect(() => {
    if (product) {
      setPrompt(`Crie uma imagem publicitária de alta qualidade para o produto: ${product.name}. Categoria: ${product.category}. Fundo moderno e iluminação de estúdio.`);
    }
  }, [product]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return alert("Por favor, digite um prompt para a IA.");

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      setTimeout(() => {
        setGeneratedImageUrl("https://via.placeholder.com/1024?text=Sua+Arte+Gerada+Pela+IA+Aparecer%C3%A1+Aqui");
        setIsGenerating(false);
      }, 3000);

    } catch (error) {
      alert("Erro ao gerar arte: " + error.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="art-page-container">
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" onClick={() => navigate(-1)} className="p-0 me-3 text-dark text-decoration-none">
          <ArrowLeft size={28} />
        </Button>
        <h2 className="art-page-title mb-0">
          <Palette size={28} className="me-2 text-primary" />
          Criação de Arte
        </h2>
      </div>

      <Row>
        <Col lg={7} className="mb-4">
          <Card className="art-display-card h-100">
            <Card.Header className="art-display-header">
              <Card.Title className="fw-bold text-dark mb-0">
                {product ? `Arte para: ${product.name}` : 'Sua Arte Aparecerá Aqui'}
              </Card.Title>
            </Card.Header>
            <div className="art-placeholder-box position-relative">
              {isGenerating && (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100 position-absolute" style={{ backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
                  <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                  <h5 className="mt-3 fw-bold text-primary animate-pulse">A IA está criando sua arte...</h5>
                  <small className="text-muted">Isso pode levar alguns segundos.</small>
                </div>
              )}

              {generatedImageUrl && !isGenerating && (
                <div className="w-100 h-100 d-flex flex-column align-items-center">
                  <img
                    src={generatedImageUrl}
                    alt="Arte Gerada"
                    className="img-fluid rounded"
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                  />
                  <Button variant="success" className="mt-4 px-4 py-2 fw-bold shadow-sm" onClick={() => window.open(generatedImageUrl, '_blank')}>
                    <Download size={18} className="me-2" /> Baixar Arte em Alta Resolução
                  </Button>
                </div>
              )}

              {!generatedImageUrl && !isGenerating && (
                <div className="art-placeholder-text">
                  <Sparkles size={50} className="mb-3 text-primary opacity-50" />
                  <h5 className="mb-1 text-dark fw-bold">Área de Visualização</h5>
                  <p className="small text-muted mb-0">Preencha as configurações ao lado e clique em gerar.</p>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col lg={5} className="mb-4">
          <Card className="art-settings-card h-100">
            <Card.Header className="art-settings-header">
              <Card.Title className="h6 fw-bold text-dark mb-0">Configurações da IA</Card.Title>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleGenerate}>
                <Form.Group className="mb-4">
                  <Form.Label className="art-label">Prompt (Descrição da Imagem)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    className="art-input-field"
                    placeholder="Descreva detalhadamente como você quer a imagem..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="art-label">Estilo Visual</Form.Label>
                  <Form.Select
                    className="art-input-field"
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                  >
                    <option value="Realista">Fotografia Realista</option>
                    <option value="Minimalista">Design Minimalista (Fundo Branco)</option>
                    <option value="Retro-futurista">Cyberpunk / Retro-futurista</option>
                    <option value="Ilustração 3D">Renderização 3D (Estilo Pixar)</option>
                    <option value="Publicidade">Banner Publicitário Brilhante</option>
                  </Form.Select>
                </Form.Group>

                <Row className="mb-4">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="art-label">Largura (px)</Form.Label>
                      <Form.Control
                        type="number"
                        className="art-input-field"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        step="64"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="art-label">Altura (px)</Form.Label>
                      <Form.Control
                        type="number"
                        className="art-input-field"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        step="64"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="art-generate-btn w-100 py-3"
                    disabled={isGenerating}
                  >
                    <Rocket size={20} className="me-2" />
                    {isGenerating ? 'Processando na Nuvem...' : 'Gerar Arte com IA'}
                  </Button>
                </div>
              </Form>

              <div className="art-gallery-container mt-5">
                <h6 className="fw-bold text-dark d-flex justify-content-between align-items-center mb-3">
                  Histórico Recente
                </h6>
                <div className="art-gallery-grid">
                  <div className="art-gallery-thumb"></div>
                  <div className="art-gallery-thumb"></div>
                  <div className="art-gallery-thumb"></div>
                  <div className="art-gallery-thumb"></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GenerateArtPage;