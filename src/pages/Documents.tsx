import { useState, useEffect } from 'react';
import { FileText, Upload, Filter, Trash2, Loader, Download } from 'lucide-react';
import { supabase, uploadFile, deleteFile, downloadFile } from '../lib/supabase';
import type { MedicalDocument } from '../types/database';

export function Documents() {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDetails, setUploadDetails] = useState({
    title: '',
    category: 'Other',
    notes: '',
    file: null as File | null
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [viewFile, setViewFile] = useState<string | null>(null); // State to track file to be viewed

  const categories = ['Prescriptions', 'Lab Reports', 'Bills', 'Other'];

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory]);

  const fetchDocuments = async () => {
    setIsFetching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('medical_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, JPEG, and PNG files are allowed');
        return;
      }

      setUploadDetails(prev => ({
        ...prev,
        file,
        title: file.name
      }));
      setShowUploadModal(true);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDetails.file || !uploadDetails.title || !uploadDetails.category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { path, url } = await uploadFile(uploadDetails.file, 'medical-documents');

      const { error: dbError } = await supabase
        .from('medical_documents')
        .insert({
          user_id: user.id,
          title: uploadDetails.title,
          category: uploadDetails.category,
          document_url: url,
          document_path: path,
          notes: uploadDetails.notes,
          uploaded_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      await fetchDocuments();
      setShowUploadModal(false);
      setUploadDetails({
        title: '',
        category: 'Other',
        notes: '',
        file: null
      });
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string, documentPath: string) => {
    setIsDeleting(documentId);
    try {
      await deleteFile(documentPath, 'medical-documents');
      const { error } = await supabase
        .from('medical_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (documentId: string, path: string, fileName: string) => {
    setIsDownloading(documentId);
    try {
      const blob = await downloadFile(path, 'medical-documents');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      setError('Failed to download document. Please try again.');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleView = (filePath: string) => {
    setViewFile(filePath); // Set the file to be viewed
  };

  const handleCloseModal = () => {
    setViewFile(null); // Close the modal
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="sm:text-2xl font-bold text-gray-900 text-xl">Medical Documents</h1>
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors sm:px-3 sm:py-1 text-sm md:text-base">
              <Upload className="h-5 w-5 mr-2" />
              Upload Document
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
              <button 
                onClick={() => setError(null)} 
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-center mb-6">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {isFetching ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <h3 className="ml-2 font-medium text-gray-900" title={doc.title}>
                        {doc.title.length > 30 ? (
                          <span className="truncate sm:max-w-xs md:max-w-sm lg:max-w-md">{doc.title.slice(0, 20)}...</span>
                        ) : doc.title.length > 20 ? (
                          <span className="truncate sm:max-w-xs md:max-w-sm">{doc.title.slice(0, 20)}...</span>
                        ) : doc.title.length > 10 ? (
                          <span className="truncate sm:max-w-xs">{doc.title.slice(0, 10)}...</span>
                        ) : (
                          doc.title
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(doc.document_path)} // Open the file in modal
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc.id, doc.document_path, doc.title)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        disabled={isDownloading === doc.id}
                        title="Download"
                      >
                        {isDownloading === doc.id ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Download className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.document_path)}
                        disabled={isDeleting === doc.id}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        {isDeleting === doc.id ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{doc.category}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                  {doc.notes && (
                    <p className="text-sm text-gray-600 mt-2 truncate">{doc.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={uploadDetails.title}
                  onChange={(e) => setUploadDetails(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border rounded-md py-2 px-3 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={uploadDetails.category}
                  onChange={(e) => setUploadDetails(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border rounded-md py-2 px-3 text-gray-700"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                  value={uploadDetails.notes}
                  onChange={(e) => setUploadDetails(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border rounded-md py-2 px-3 text-gray-700"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? <Loader className="h-5 w-5 animate-spin" /> : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View File Modal */}
      {viewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 max-w-4xl w-full">
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 p-2 text-white bg-red-500 rounded-full"
            >
              ×
            </button>
            {viewFile.endsWith('.pdf') ? (
              <iframe
                src={viewFile}
                className="w-full h-96"
                title="Document Viewer"
                frameBorder="0"
              />
            ) : (
              <img
                src={viewFile}
                alt="Document Preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
