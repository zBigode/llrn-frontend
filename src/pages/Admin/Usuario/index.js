import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { get } from 'lodash';
import Modal from 'react-modal';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

import axios from '../../../services/axios';
import Loading from '../../../components/Loading';
import Navbar from '../../../components/Navbar';
import './style.css';

export default function Usuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState('');
  const [dataNasc, setDataNasc] = useState('');

  const [searchNome, setSearchNome] = useState('');
  const [searchCpf, setSearchCpf] = useState('');
  const [searchTipo, setSearchTipo] = useState('');

  useEffect(() => {
    loadRegisters();
  }, []);

  const loadRegisters = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/usuarios/');

      setIsLoading(false);
      setUsuarios(data);
    } catch (error) {
      setIsLoading(false);
      const { erros } = error.response.data;
      erros.map((err) => toast.error(err));
    }
  };

  const handleSearch = async () => {
    const querys = new URLSearchParams({
      cpf: searchCpf,
      nome: searchNome,
      tipo: searchTipo,
    }).toString();

    setIsLoading(true);
    try {
      let response = null;

      if (searchCpf || searchNome || searchTipo) {
        response = await axios.get(`/usuarios/search/${querys}`);
      } else {
        response = await axios.get('/usuarios/');
      }

      setIsLoading(false);
      setUsuarios(response.data);
    } catch (error) {
      setIsLoading(false);
      const { erros } = error.response.data;
      erros.map((err) => toast.error(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let regTemp = {
        cpf,
        nome,
        email,
        telefone,
        tipo,
        data_nasc: dataNasc,
      };

      if (password) {
        regTemp = { ...regTemp, password };
      }

      setIsLoading(true);
      if (isUpdating) {
        await axios.put(`/usuarios/${cpf}`, regTemp);
        toast.success('Usu??rio atualizado com sucesso!');
      } else {
        await axios.post('/usuarios', regTemp);
        toast.success('Usu??rio cadastrado com sucesso!');
      }
      setIsLoading(false);

      handleClose();
      setIsUpdating(false);
      loadRegisters();
    } catch (error) {
      setIsLoading(false);
      const erros = get(error, 'response.data.erros', []);
      erros.map((err) => toast.error(err));
    }
  };

  const handleUpdate = (usuario) => {
    setCpf(usuario.cpf);
    setNome(usuario.nome);
    setTelefone(usuario.telefone);
    setEmail(usuario.email);
    setPassword('');
    setTipo(usuario.tipo);
    setDataNasc(moment(usuario.data_nasc).format('YYYY-MM-DD'));
    setShowModal(true);
    setIsUpdating(true);
  };

  const handleDelete = async (cpfUsuario) => {
    setIsLoading(true);
    try {
      await axios.delete(`/usuarios/${cpfUsuario}`);

      setIsLoading(false);
      await loadRegisters();
    } catch (error) {
      setIsLoading(false);
      const { erros } = error.response.data;
      erros.map((err) => toast.error(err));
    }
  };

  const clearModal = () => {
    setCpf('');
    setNome('');
    setTelefone('');
    setEmail('');
    setPassword('');
    setTipo('');
    setDataNasc('');
  };

  const clearSearch = () => {
    setSearchCpf('');
    setSearchNome('');
    setSearchTipo('');
    loadRegisters();
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setIsUpdating(false);
    clearModal();
  };

  return (
    <>
      <Navbar />
      <Loading isLoading={isLoading} />

      <div className="container-usuario">
        <div className="search-container">
          <div className="search-form">
            <label>CPF</label>
            <input
              type="text"
              name="cpf"
              placeholder="CPF"
              value={searchCpf}
              onChange={(e) => setSearchCpf(e.target.value)}
            />

            <label>Nome</label>
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              value={searchNome}
              onChange={(e) => setSearchNome(e.target.value)}
            />

            <label>Tipo</label>
            <select
              name="tipo"
              id="tipo"
              defaultValue={searchTipo}
              onChange={(e) => setSearchTipo(e.target.value)}
            >
              <option value="" disabled selected={searchTipo === ''}>
                Selecione um tipo
              </option>
              <option value="0">Administrador</option>
              <option value="1">Usu??rio comum</option>
            </select>

            <div className="buttons">
              <button className="btn" type="button" onClick={handleSearch}>
                Pesquisar
              </button>
              <button className="btn" type="button" onClick={clearSearch}>
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="usuario-content">
          <div className="overflow-auto rounded-lg shadow-xl">
            <table className="w-full border-separate">
              <thead className="bg-gray-100 border-b-2 border-gray-200 ">
                <tr>
                  <th className="min-w-36 p-3 font-semibold tracking-wide text-center">
                    CPF
                  </th>
                  <th className="p-3 font-semibold tracking-wide text-center">
                    Nome
                  </th>
                  <th className="min-w-48 p-3 font-semibold tracking-wide text-center">
                    Tipo
                  </th>
                  <th className="min-w-48 p-3 font-semibold tracking-wide text-center">
                    A????es
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 ">
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.cpf}
                    className="even:bg-gray-50 odd:bg-white hover:bg-gray-200"
                  >
                    <td className="p-3 text-gray-700 text-center whitespace-nowrap">
                      {usuario.cpf}
                    </td>
                    <td className="p-3 text-gray-700 text-center whitespace-nowrap">
                      {usuario.nome}
                    </td>
                    <td className="p-3 text-gray-700 text-center whitespace-nowrap">
                      {usuario.tipo === 0 ? 'Administrador' : 'Usu??rio comum'}
                    </td>
                    <td className="p-3 text-gray-700 text-center whitespace-nowrap flex justify-center gap-2">
                      <button
                        type="button"
                        className="round-blue-btn"
                        onClick={() => handleUpdate(usuario)}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        type="button"
                        className="round-red-btn"
                        onClick={() => handleDelete(usuario.cpf)}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="btn mx-auto my-5"
            type="button"
            onClick={handleShow}
          >
            Cadastrar
          </button>
        </div>

        <Modal
          isOpen={showModal}
          onRequestClose={handleClose}
          className="Modal"
          overlayClassName="Overlay"
          ariaHideApp={false}
        >
          <div className="ModalHeader">
            <span>{isUpdating ? 'Editar' : 'Cadastrar'} usu??rio</span>
            <button className="CloseModal" type="button" onClick={handleClose}>
              x
            </button>
          </div>
          <div className="ModalContent">
            <div className="form-usuario">
              <label>CPF</label>
              <input
                id="cpf"
                type="text"
                name="cpf"
                placeholder="cpf"
                value={cpf}
                disabled={!!isUpdating}
                onChange={(e) => setCpf(e.target.value)}
              />
              <br />
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                placeholder="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <br />
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                placeholder="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
              <br />
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <br />
              <label>Senha</label>
              <input
                type="password"
                name="password"
                placeholder="senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <br />
              <label>Tipo</label>
              <select
                name="tipo"
                id="tipo"
                defaultValue={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="" disabled selected>
                  Selecione um tipo
                </option>
                <option value="0">Administrador</option>
                <option value="1">Usu??rio comum</option>
              </select>
              <br />
              <label>Data Nascimento</label>
              <input
                type="date"
                value={dataNasc}
                onChange={(e) =>
                  setDataNasc(
                    moment(e.target.value, 'YYYY-MM-DD').format('DD/MM/YYYY')
                  )
                }
              />
            </div>
          </div>
          <div className="ModalFooter">
            <button className="btn" type="button" onClick={clearModal}>
              Limpar
            </button>
            <button className="btn" type="submit" onClick={handleSubmit}>
              {isUpdating ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
