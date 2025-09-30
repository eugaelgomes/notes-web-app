import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const { createUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateImage = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type))
      return "Formato inválido. Use JPEG, PNG, GIF ou WebP.";
    if (file.size > 5 * 1024 * 1024) return "Imagem deve ter até 5MB.";
    return null;
  };

  const handleImage = (file) => {
    const error = validateImage(file);
    if (error) return setMsg({ type: "error", text: error });

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) handleImage(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleImage(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({});

    if (!formData.name.trim())
      return setMsg({ type: "error", text: "Nome é obrigatório." });
    if (!formData.username.trim())
      return setMsg({ type: "error", text: "Usuário é obrigatório." });
    if (!formData.email.trim())
      return setMsg({ type: "error", text: "E-mail é obrigatório." });
    if (!formData.password)
      return setMsg({ type: "error", text: "Senha é obrigatória." });

    try {
      setSubmitting(true);
      
      // Por enquanto, o backend não suporta upload de imagens
      // Enviamos apenas os dados do formulário como JSON
      const payload = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const res = await createUser(payload);

      if (res.success) {
        setMsg({ type: "success", text: res.message || "Cadastro realizado!" });
        setTimeout(() => navigate("/"), 1200);
      } else {
        setMsg({ type: "error", text: res.message || "Falha no cadastro." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Erro ao conectar com o servidor." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white rounded-md border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Criar Conta
        </h2>
        <p className="text-xs text-gray-500 mb-4">Preencha os dados</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Upload */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-600 mb-1">
              Foto de Perfil (Em desenvolvimento)
            </label>
            <div
              className={`w-20 h-20 rounded-full border flex items-center justify-center cursor-pointer text-xs opacity-50 ${
                dragActive
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaCamera className="text-gray-400 text-lg" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={true}
            />
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="name"
              placeholder="Nome completo"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded border text-sm"
              disabled={submitting}
            />
            <input
              type="text"
              name="username"
              placeholder="Usuário"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 rounded border text-sm"
              disabled={submitting}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 rounded border text-sm"
            disabled={submitting}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 pr-8 rounded border text-sm"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-white py-2 rounded text-sm font-semibold hover:bg-yellow-500 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Cadastrando..." : "Criar Conta"}
          </button>

          <p className="text-center text-xs text-gray-600">
            Já possui uma conta?{" "}
            <Link to="/sign-in" className="text-yellow-500 font-semibold">
              Fazer login
            </Link>
          </p>

          {msg.text && (
            <div
              className={`p-2 rounded text-xs text-center ${
                msg.type === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {msg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
