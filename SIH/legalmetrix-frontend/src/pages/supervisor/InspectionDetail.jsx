import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  ScanLine,
  Sparkles,
  ShieldCheck,
  FileText,
  Plus,
  Image as ImageIcon,
  Camera,
} from 'lucide-react';
import { api } from '../../api/client.js';
import CameraCapture from '../../components/CameraCapture.jsx';
import {
  Card,
  Button,
  Field,
  Input,
  Select,
  ErrorBanner,
  Badge,
  Spinner,
  EmptyState,
} from '../../components/ui.jsx';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  inspectionStatusTone,
  complianceResultTone,
  severityTone,
  verificationTone,
  humanizeEnum,
} from '../../utils/format.js';

const EVIDENCE_TYPES = ['FRONT', 'BACK', 'LABEL', 'SIDE', 'OTHER'];

const emptyProductForm = {
  productName: '',
  brandName: '',
  manufacturer: '',
  manufacturerAddress: '',
  mrp: '',
  netQuantity: '',
  manufacturingOrPackingDate: '',
  expiryDate: '',
  countryOfOrigin: '',
  batchNumber: '',
  consumerCareDetails: '',
};

function SectionCard({ title, icon: Icon, action, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-primary" />}
          <h2 className="font-medium">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-border-subtle last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-right">{value ?? '—'}</span>
    </div>
  );
}

export default function InspectionDetail() {
  const { id } = useParams();

  const [inspection, setInspection] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [products, setProducts] = useState([]);
  const [extraction, setExtraction] = useState(null);
  const [violations, setViolations] = useState([]);
  const [result, setResult] = useState(null);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // name of in-flight action

  // Evidence upload form state
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [imageType, setImageType] = useState('FRONT');
  const [evidenceProductId, setEvidenceProductId] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);

  const chooseFile = useCallback((nextFile) => {
    setFile(nextFile);
    setFilePreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return nextFile ? URL.createObjectURL(nextFile) : null;
    });
  }, []);

  const handleCapturedPhoto = (capturedFile) => {
    chooseFile(capturedFile);
    setCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [insp, ev, prod] = await Promise.all([
        api.getInspection(id),
        api.getEvidence(id).catch(() => []),
        api.getProducts(id).catch(() => []),
      ]);
      setInspection(insp);
      setEvidence(ev);
      setProducts(prod);

      // These may 404 until the relevant step has run — fail quietly.
      api.getExtraction(id).then(setExtraction).catch(() => setExtraction(null));
      api.getViolations(id).then(setViolations).catch(() => setViolations([]));
      api.getComplianceResult(id).then(setResult).catch(() => setResult(null));
      api.getReports(id).then(setReports).catch(() => setReports([]));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const runAction = async (name, fn) => {
    setBusy(name);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Choose an image file first.');
      return;
    }
    await runAction('upload', async () => {
      const saved = await api.uploadEvidence(id, file, imageType, evidenceProductId || undefined);
      setEvidence((prev) => [...prev, saved]);
      chooseFile(null);
      e.target.reset();
    });
  };

  const handleProcess = () =>
    runAction('process', async () => {
      await api.processInspection(id);
      const refreshedEvidence = await api.getEvidence(id).catch(() => evidence);
      setEvidence(refreshedEvidence);
    });

  const handleExtract = () =>
    runAction('extract', async () => {
      const extracted = await api.extract(id);
      setExtraction(extracted);
    });

  const handleValidate = () =>
    runAction('validate', async () => {
      const res = await api.validateInspection(id);
      setResult(res);
      setViolations(res.violations || []);
      const refreshedInspection = await api.getInspection(id).catch(() => inspection);
      setInspection(refreshedInspection);
    });

  const handleGenerateReport = () =>
    runAction('report', async () => {
      const report = await api.generateReport(id);
      setReports((prev) => [...prev, report]);
    });

  const openCreateProduct = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
    setShowProductForm(true);
  };

  const openEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      productName: product.productName || '',
      brandName: product.brandName || '',
      manufacturer: product.manufacturer || '',
      manufacturerAddress: product.manufacturerAddress || '',
      mrp: product.mrp ?? '',
      netQuantity: product.netQuantity || '',
      manufacturingOrPackingDate: product.manufacturingOrPackingDate || '',
      expiryDate: product.expiryDate || '',
      countryOfOrigin: product.countryOfOrigin || '',
      batchNumber: product.batchNumber || '',
      consumerCareDetails: product.consumerCareDetails || '',
    });
    setShowProductForm(true);
  };

  const useExtractionForNewProduct = () => {
    if (!extraction) return;
    setEditingProductId(null);
    setProductForm({
      productName: extraction.productName || '',
      brandName: extraction.brandName || '',
      manufacturer: extraction.manufacturer || '',
      manufacturerAddress: extraction.manufacturerAddress || '',
      mrp: extraction.mrp ?? '',
      netQuantity: extraction.netQuantity || '',
      manufacturingOrPackingDate: extraction.manufacturingOrPackingDate || '',
      expiryDate: extraction.expiryDate || '',
      countryOfOrigin: extraction.countryOfOrigin || '',
      batchNumber: extraction.batchNumber || '',
      consumerCareDetails: extraction.consumerCareDetails || '',
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      mrp: productForm.mrp === '' ? null : Number(productForm.mrp),
      manufacturingOrPackingDate: productForm.manufacturingOrPackingDate || null,
      expiryDate: productForm.expiryDate || null,
    };
    await runAction('product', async () => {
      if (editingProductId) {
        const updated = await api.updateProduct(id, editingProductId, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? updated : p)));
      } else {
        const created = await api.createProduct(id, payload);
        setProducts((prev) => [...prev, created]);
      }
      setShowProductForm(false);
      setProductForm(emptyProductForm);
      setEditingProductId(null);
    });
  };

  if (loading) {
    return <p className="text-sm text-text-muted py-10 text-center">Loading inspection…</p>;
  }

  if (!inspection) {
    return <ErrorBanner message={error || 'Inspection not found.'} />;
  }

  return (
    <div className="space-y-6">
      <Link to="/inspections" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft size={15} />
        Back to inspections
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">{inspection.location || 'Untitled location'}</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Created {formatDate(inspection.inspectionDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={inspectionStatusTone(inspection.status)}>{humanizeEnum(inspection.status)}</Badge>
          {inspection.overallResult && (
            <Badge tone={complianceResultTone(inspection.overallResult)}>
              {humanizeEnum(inspection.overallResult)}
            </Badge>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Workflow actions */}
      <Card className="p-5">
        <h2 className="font-medium mb-1">Workflow</h2>
        <p className="text-sm text-text-muted mb-4">
          Upload evidence photos, then run these steps in order.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleProcess} disabled={busy === 'process'}>
            {busy === 'process' ? <Spinner /> : <ScanLine size={16} />}
            Run OCR
          </Button>
          <Button variant="secondary" onClick={handleExtract} disabled={busy === 'extract'}>
            {busy === 'extract' ? <Spinner /> : <Sparkles size={16} />}
            Extract data
          </Button>
          <Button variant="secondary" onClick={handleValidate} disabled={busy === 'validate'}>
            {busy === 'validate' ? <Spinner /> : <ShieldCheck size={16} />}
            Validate compliance
          </Button>
          <Button variant="secondary" onClick={handleGenerateReport} disabled={busy === 'report'}>
            {busy === 'report' ? <Spinner /> : <FileText size={16} />}
            Generate report
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Evidence */}
        <SectionCard title="Evidence photos" icon={ImageIcon}>
          <form onSubmit={handleUpload} className="space-y-3 mb-4">
            {filePreviewUrl ? (
              <div className="relative">
                <img
                  src={filePreviewUrl}
                  alt="Selected evidence preview"
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => chooseFile(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded-full px-2.5 py-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary" onClick={() => setCameraOpen(true)}>
                  <Camera size={16} />
                  Take photo
                </Button>
                <label className="inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm px-4 py-2.5 border border-border text-text-primary hover:bg-surface-secondary cursor-pointer transition-colors">
                  <UploadCloud size={16} />
                  Choose file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => chooseFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select value={imageType} onChange={(e) => setImageType(e.target.value)}>
                  {EVIDENCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {humanizeEnum(t)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Product (optional)">
                <Select value={evidenceProductId} onChange={(e) => setEvidenceProductId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName || 'Unnamed product'}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="submit" className="w-full" disabled={busy === 'upload' || !file}>
              {busy === 'upload' ? <Spinner /> : <UploadCloud size={16} />}
              Upload evidence
            </Button>
          </form>

          {cameraOpen && (
            <CameraCapture onCapture={handleCapturedPhoto} onClose={() => setCameraOpen(false)} />
          )}

          {evidence.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No evidence uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {evidence.map((ev) => (
                <li key={ev.id} className="rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Badge tone="neutral">{humanizeEnum(ev.imageType)}</Badge>
                    <span className="text-xs text-text-muted">{formatDateTime(ev.uploadedAt)}</span>
                  </div>
                  {ev.ocrText && (
                    <p className="text-xs text-text-secondary mt-2 line-clamp-3">{ev.ocrText}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Extraction */}
        <SectionCard
          title="Extracted label data"
          icon={Sparkles}
          action={
            extraction && (
              <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={useExtractionForNewProduct}>
                <Plus size={14} />
                Use as product
              </Button>
            )
          }
        >
          {!extraction ? (
            <p className="text-sm text-text-muted text-center py-4">
              Run OCR and extraction to see structured label data here.
            </p>
          ) : (
            <div>
              <DataRow label="Product name" value={extraction.productName} />
              <DataRow label="Brand" value={extraction.brandName} />
              <DataRow label="Manufacturer" value={extraction.manufacturer} />
              <DataRow label="Manufacturer address" value={extraction.manufacturerAddress} />
              <DataRow label="MRP" value={formatCurrency(extraction.mrp)} />
              <DataRow label="Net quantity" value={extraction.netQuantity} />
              <DataRow label="Mfg / packing date" value={formatDate(extraction.manufacturingOrPackingDate)} />
              <DataRow label="Expiry date" value={formatDate(extraction.expiryDate)} />
              <DataRow label="Country of origin" value={extraction.countryOfOrigin} />
              <DataRow label="Batch number" value={extraction.batchNumber} />
              <DataRow label="Consumer care" value={extraction.consumerCareDetails} />
            </div>
          )}
        </SectionCard>
      </div>

      {/* Products */}
      <SectionCard
        title="Products"
        icon={FileText}
        action={
          <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={openCreateProduct}>
            <Plus size={14} />
            Add product
          </Button>
        }
      >
        {showProductForm && (
          <form
            onSubmit={handleProductSubmit}
            className="grid sm:grid-cols-2 gap-3 mb-5 p-4 rounded-lg bg-surface-secondary"
          >
            <Field label="Product name">
              <Input
                value={productForm.productName}
                onChange={(e) => setProductForm((f) => ({ ...f, productName: e.target.value }))}
              />
            </Field>
            <Field label="Brand name">
              <Input
                value={productForm.brandName}
                onChange={(e) => setProductForm((f) => ({ ...f, brandName: e.target.value }))}
              />
            </Field>
            <Field label="Manufacturer">
              <Input
                value={productForm.manufacturer}
                onChange={(e) => setProductForm((f) => ({ ...f, manufacturer: e.target.value }))}
              />
            </Field>
            <Field label="Manufacturer address">
              <Input
                value={productForm.manufacturerAddress}
                onChange={(e) => setProductForm((f) => ({ ...f, manufacturerAddress: e.target.value }))}
              />
            </Field>
            <Field label="MRP">
              <Input
                type="number"
                step="0.01"
                value={productForm.mrp}
                onChange={(e) => setProductForm((f) => ({ ...f, mrp: e.target.value }))}
              />
            </Field>
            <Field label="Net quantity">
              <Input
                value={productForm.netQuantity}
                onChange={(e) => setProductForm((f) => ({ ...f, netQuantity: e.target.value }))}
                placeholder="e.g. 500 g"
              />
            </Field>
            <Field label="Manufacturing / packing date">
              <Input
                type="date"
                value={productForm.manufacturingOrPackingDate || ''}
                onChange={(e) =>
                  setProductForm((f) => ({ ...f, manufacturingOrPackingDate: e.target.value }))
                }
              />
            </Field>
            <Field label="Expiry date">
              <Input
                type="date"
                value={productForm.expiryDate || ''}
                onChange={(e) => setProductForm((f) => ({ ...f, expiryDate: e.target.value }))}
              />
            </Field>
            <Field label="Country of origin">
              <Input
                value={productForm.countryOfOrigin}
                onChange={(e) => setProductForm((f) => ({ ...f, countryOfOrigin: e.target.value }))}
              />
            </Field>
            <Field label="Batch number">
              <Input
                value={productForm.batchNumber}
                onChange={(e) => setProductForm((f) => ({ ...f, batchNumber: e.target.value }))}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Consumer care details">
                <Input
                  value={productForm.consumerCareDetails}
                  onChange={(e) => setProductForm((f) => ({ ...f, consumerCareDetails: e.target.value }))}
                />
              </Field>
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProductId(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy === 'product'}>
                {busy === 'product' ? 'Saving…' : editingProductId ? 'Save changes' : 'Add product'}
              </Button>
            </div>
          </form>
        )}

        {products.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">
            No products recorded for this inspection yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-border">
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 pr-3 font-medium">Brand</th>
                  <th className="py-2 pr-3 font-medium">MRP</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border-subtle last:border-0">
                    <td className="py-2.5 pr-3">{p.productName || '—'}</td>
                    <td className="py-2.5 pr-3">{p.brandName || '—'}</td>
                    <td className="py-2.5 pr-3">{formatCurrency(p.mrp)}</td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={verificationTone(p.verificationStatus)}>
                        {humanizeEnum(p.verificationStatus)}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => openEditProduct(p)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Compliance */}
      <SectionCard title="Compliance result" icon={ShieldCheck}>
        {!result ? (
          <p className="text-sm text-text-muted text-center py-4">
            Run "Validate compliance" to see results here.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge tone={complianceResultTone(result.overallResult)}>
                {humanizeEnum(result.overallResult)}
              </Badge>
              <span className="text-sm text-text-muted">
                {result.violationCount} violation{result.violationCount === 1 ? '' : 's'} found
              </span>
            </div>
            {violations.length > 0 && (
              <ul className="space-y-2">
                {violations.map((v) => (
                  <li key={v.id} className="rounded-lg border border-border px-3.5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{v.violationType || v.ruleCode}</p>
                      <Badge tone={severityTone(v.severity)}>{humanizeEnum(v.severity)}</Badge>
                    </div>
                    {v.description && (
                      <p className="text-sm text-text-secondary mt-1">{v.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-text-muted">
                      {v.expectedValue && <span>Expected: {v.expectedValue}</span>}
                      {v.detectedValue && <span>Detected: {v.detectedValue}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </SectionCard>

      {/* Reports */}
      <SectionCard title="Reports" icon={FileText}>
        {reports.length === 0 ? (
          <EmptyState
            title="No report generated yet"
            description="Generate a report once compliance has been validated."
          />
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-border px-3.5 py-3"
              >
                <div>
                  <p className="text-sm font-medium">Report</p>
                  <p className="text-xs text-text-muted mt-0.5 break-all">{r.reportUrl}</p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {formatDateTime(r.generatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
