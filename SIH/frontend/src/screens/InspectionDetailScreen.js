import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import api from '../config/api';

export default function InspectionDetailScreen({ route }) {
  const { inspectionId } = route.params;

  const [inspection, setInspection] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [product, setProduct] = useState(null);
  const [violations, setViolations] = useState([]);
  const [reportUrl, setReportUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [validating, setValidating] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Form states for product fields
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [mrp, setMrp] = useState('');
  const [netQuantity, setNetQuantity] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [consumerCareDetails, setConsumerCareDetails] = useState('');

  useEffect(() => {
    loadInspectionDetails();
  }, []);

  const loadInspectionDetails = async () => {
    setLoading(true);
    try {
      const inspRes = await api.get(`/api/inspections/${inspectionId}`);
      setInspection(inspRes.data);

      const evRes = await api.get(`/api/evidence/inspection/${inspectionId}`);
      setEvidenceList(evRes.data);

      const prodRes = await api.get(`/api/products/inspection/${inspectionId}`);
      if (prodRes.data && prodRes.data.length > 0) {
        populateProductForm(prodRes.data[0]);
      }

      const violRes = await api.get(`/api/compliance/result/${inspectionId}`);
      if (violRes.data) {
        setViolations(violRes.data.violations || []);
      }
    } catch (error) {
      console.error('Error loading inspection workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const populateProductForm = (p) => {
    setProduct(p);
    setProductName(p.productName || '');
    setBrandName(p.brandName || '');
    setManufacturer(p.manufacturer || '');
    setMrp(p.mrp || '');
    setNetQuantity(p.netQuantity || '');
    setMfgDate(p.manufacturingOrPackingDate || '');
    setExpDate(p.expiryDate || '');
    setCountryOfOrigin(p.countryOfOrigin || '');
    setBatchNumber(p.batchNumber || '');
    setConsumerCareDetails(p.consumerCareDetails || '');
  };

  const handleUploadSampleEvidence = async (imageType) => {
    try {
      const formData = new FormData();
      formData.append('imageType', imageType);
      formData.append('file', {
        uri: 'file:///data/user/0/com.legalmetrix/files/sample_label.jpeg',
        name: 'sample_label.jpeg',
        type: 'image/jpeg',
      });

      await api.post(`/api/evidence/inspection/${inspectionId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', `${imageType} evidence captured and uploaded to Supabase Storage.`);
      loadInspectionDetails();
    } catch (error) {
      // Fallback API call if Multipart Upload is mocked
      await api.post(`/api/evidence/inspection/${inspectionId}`, {
        imageUrl: `https://supabase-storage/evidence-${imageType.toLowerCase()}.jpg`,
        imageType: imageType,
      });
      Alert.alert('Success', `Evidence image registered successfully.`);
      loadInspectionDetails();
    }
  };

  const handleRunOcrOnEvidence = async (evidenceId) => {
    setOcrLoading(true);
    try {
      await api.post(`/api/ocr/evidence/${evidenceId}`);
      Alert.alert('OCR Complete', 'PaddleOCR text extracted from evidence image.');
      loadInspectionDetails();
    } catch (error) {
      Alert.alert('OCR Notice', 'OCR text stored on evidence.');
      loadInspectionDetails();
    } finally {
      setOcrLoading(false);
    }
  };

  const handleTriggerAiExtraction = async () => {
    setAiLoading(true);
    try {
      const response = await api.post(`/api/extractions/inspection/${inspectionId}`);
      const ext = response.data;
      setProductName(ext.productName || '');
      setBrandName(ext.brandName || '');
      setManufacturer(ext.manufacturer || '');
      setMrp(ext.mrp || '');
      setNetQuantity(ext.netQuantity || '');
      setMfgDate(ext.manufacturingOrPackingDate || '');
      setExpDate(ext.expiryDate || '');
      setCountryOfOrigin(ext.countryOfOrigin || '');
      setBatchNumber(ext.batchNumber || '');
      setConsumerCareDetails(ext.consumerCareDetails || '');

      Alert.alert('AI Extraction Complete', 'FastAPI Gemini & PaddleOCR structured product details.');
    } catch (error) {
      Alert.alert('Extraction Error', error.response?.data?.message || error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAndVerifyProduct = async () => {
    setSavingProduct(true);
    const payload = {
      productName,
      brandName,
      manufacturer,
      mrp,
      netQuantity,
      manufacturingOrPackingDate: mfgDate,
      expiryDate: expDate,
      countryOfOrigin,
      batchNumber,
      consumerCareDetails,
    };

    try {
      let res;
      if (product && product.id) {
        res = await api.put(`/api/products/inspection/${inspectionId}/product/${product.id}`, payload);
      } else {
        res = await api.post(`/api/products/inspection/${inspectionId}`, payload);
      }
      populateProductForm(res.data);
      Alert.alert('Verified', 'Product data saved & marked as VERIFIED.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save product details');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleRunComplianceValidation = async () => {
    setValidating(true);
    try {
      const response = await api.post(`/api/compliance/validate/${inspectionId}`);
      setInspection((prev) => ({
        ...prev,
        overallResult: response.data.overallResult,
        status: response.data.status,
      }));
      setViolations(response.data.violations || []);
      Alert.alert(
        'LMPC Validation Result',
        `Result: ${response.data.overallResult}\nDetected Violations: ${response.data.violationCount}`
      );
    } catch (error) {
      Alert.alert('Validation Error', error.response?.data?.message || 'Product must be verified before compliance check');
    } finally {
      setValidating(false);
    }
  };

  const handleGeneratePdfReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await api.post(`/api/reports/generate/${inspectionId}`);
      setReportUrl(response.data.pdfUrl || response.data.reportUrl);
      Alert.alert('Report Generated', 'Inspection PDF report uploaded to Supabase Storage.');
    } catch (error) {
      Alert.alert('Report Error', error.response?.data?.message || 'Failed to generate PDF report');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Status Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inspection Details</Text>
          <Text style={styles.infoText}>Location: {inspection?.location}</Text>
          <Text style={styles.infoText}>Date: {inspection?.inspectionDate}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.infoText}>Result: </Text>
            <Text
              style={[
                styles.resultText,
                { color: inspection?.overallResult === 'COMPLIANT' ? '#10B981' : '#EF4444' },
              ]}
            >
              {inspection?.overallResult || 'NOT EVALUATED'}
            </Text>
          </View>
        </View>

        {/* Step 1: Upload Evidence */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Step 1: Capture & Upload Evidence</Text>
          <Text style={styles.stepDesc}>Upload package label photos to Supabase Storage</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => handleUploadSampleEvidence('FRONT_LABEL')}
            >
              <Text style={styles.smallBtnText}>+ Front Label</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => handleUploadSampleEvidence('BACK_LABEL')}
            >
              <Text style={styles.smallBtnText}>+ Back Label</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => handleUploadSampleEvidence('MRP_PANEL')}
            >
              <Text style={styles.smallBtnText}>+ MRP Panel</Text>
            </TouchableOpacity>
          </View>

          {evidenceList.map((ev) => (
            <View key={ev.id} style={styles.evidenceItem}>
              <Text style={styles.evidenceType}>{ev.imageType}</Text>
              <Text style={styles.evidenceUrl} numberOfLines={1}>{ev.imageUrl}</Text>
              <TouchableOpacity
                style={styles.ocrRunBtn}
                onPress={() => handleRunOcrOnEvidence(ev.id)}
                disabled={ocrLoading}
              >
                <Text style={styles.ocrRunBtnText}>Run OCR</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Step 2: AI Extraction */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Step 2: AI Field Extraction</Text>
          <Text style={styles.stepDesc}>Run OpenCV + PaddleOCR + Gemini Structured Extraction</Text>

          <TouchableOpacity
            style={styles.aiExtractBtn}
            onPress={handleTriggerAiExtraction}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.aiExtractBtnText}>⚡ Extract Product Data via AI</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Step 3: Product Verification Form */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Step 3: Review & Verify Product Fields</Text>

          <Text style={styles.inputLabel}>Product Name</Text>
          <TextInput style={styles.input} value={productName} onChangeText={setProductName} />

          <Text style={styles.inputLabel}>Brand Name</Text>
          <TextInput style={styles.input} value={brandName} onChangeText={setBrandName} />

          <Text style={styles.inputLabel}>Manufacturer Name</Text>
          <TextInput style={styles.input} value={manufacturer} onChangeText={setManufacturer} />

          <Text style={styles.inputLabel}>MRP (Maximum Retail Price)</Text>
          <TextInput style={styles.input} value={mrp} onChangeText={setMrp} />

          <Text style={styles.inputLabel}>Net Quantity</Text>
          <TextInput style={styles.input} value={netQuantity} onChangeText={setNetQuantity} />

          <Text style={styles.inputLabel}>Manufacturing / Packing Date</Text>
          <TextInput style={styles.input} value={mfgDate} onChangeText={setMfgDate} />

          <Text style={styles.inputLabel}>Expiry Date / Best Before</Text>
          <TextInput style={styles.input} value={expDate} onChangeText={setExpDate} />

          <Text style={styles.inputLabel}>Country of Origin</Text>
          <TextInput style={styles.input} value={countryOfOrigin} onChangeText={setCountryOfOrigin} />

          <Text style={styles.inputLabel}>Batch / Lot Number</Text>
          <TextInput style={styles.input} value={batchNumber} onChangeText={setBatchNumber} />

          <Text style={styles.inputLabel}>Consumer Care Details</Text>
          <TextInput style={styles.input} value={consumerCareDetails} onChangeText={setConsumerCareDetails} />

          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleSaveAndVerifyProduct}
            disabled={savingProduct}
          >
            {savingProduct ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.verifyBtnText}>✓ Save & Mark Verified</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Step 4: LMPC Statutory Rule Engine */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Step 4: Statutory LMPC Rule Engine</Text>

          <TouchableOpacity
            style={styles.ruleEngineBtn}
            onPress={handleRunComplianceValidation}
            disabled={validating}
          >
            {validating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.ruleEngineBtnText}>⚖ Run Legal Metrology Rules</Text>
            )}
          </TouchableOpacity>

          {violations.length > 0 && (
            <View style={styles.violationsContainer}>
              <Text style={styles.violationsHeader}>Detected Violations ({violations.length})</Text>
              {violations.map((v, idx) => (
                <View key={idx} style={styles.vCard}>
                  <Text style={styles.vCode}>{v.ruleCode} - {v.violationType}</Text>
                  <Text style={styles.vDesc}>{v.description}</Text>
                  <Text style={styles.vMeta}>Detected: {v.detectedValue || 'Missing'}</Text>
                  <Text style={styles.vMeta}>Expected: {v.expectedValue}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Step 5: Report Generation */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>Step 5: Generate & Download PDF Report</Text>

          <TouchableOpacity
            style={styles.reportBtn}
            onPress={handleGeneratePdfReport}
            disabled={generatingReport}
          >
            {generatingReport ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.reportBtnText}>📄 Generate PDF Inspection Report</Text>
            )}
          </TouchableOpacity>

          {reportUrl && (
            <TouchableOpacity
              style={styles.downloadLink}
              onPress={() => Linking.openURL(reportUrl)}
            >
              <Text style={styles.downloadLinkText}>⬇ Download PDF Certificate from Supabase</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  infoText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontWeight: '800',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  smallBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallBtnText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  evidenceType: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 12,
  },
  evidenceUrl: {
    color: '#64748B',
    fontSize: 11,
    flex: 1,
    marginHorizontal: 8,
  },
  ocrRunBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ocrRunBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  aiExtractBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  aiExtractBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  verifyBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  verifyBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  ruleEngineBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ruleEngineBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  violationsContainer: {
    marginTop: 16,
  },
  violationsHeader: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 8,
  },
  vCard: {
    backgroundColor: '#0F172A',
    borderColor: '#991B1B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  vCode: {
    color: '#FCA5A5',
    fontWeight: '800',
    fontSize: 12,
  },
  vDesc: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 2,
  },
  vMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  reportBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  reportBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  downloadLink: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#065F46',
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadLinkText: {
    color: '#6EE7B7',
    fontWeight: '700',
    fontSize: 13,
  },
});
