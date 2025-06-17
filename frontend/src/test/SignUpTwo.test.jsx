import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupTwo from '../pages/Signuptwo';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('axios'); 

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('SignUpTwo render', () => {
  test('SignUpTwo orriak objektu dana erakusten du pantailan.', () => {
    render(
      <MemoryRouter initialEntries={['/signuptwo?username=user']}>
        <Routes>
          <Route path="/signuptwo" element={<SignupTwo />} />
        </Routes>
      </MemoryRouter>
    );

    const genres = [
      'Fantasy', 'Fiction', 'Romance', 'Suspense', 'History',
      'Horror', 'Sports', 'Biography', 'Science Fiction', 'Adventure', 'Other'
    ];

    genres.forEach(genre => {
      expect(screen.getByLabelText(genre)).toBeInTheDocument();
    });
  });
});

describe('erregistratu botoia', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset();
    axios.patch.mockReset();
  });

  test('Ondo gorde da eta login-era buelta ', async () => {
    axios.patch.mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={['/signuptwo?username=user']}>
        <Routes>
          <Route path="/signuptwo" element={<SignupTwo />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('Fantasy'));
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/user/user'),
        { favoriteGenres: ['Fantasy'] }
      );
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('Errore bat gertatu da', async () => {
    axios.patch.mockResolvedValue({ data: { success: false, message: 'error' } });

    render(
      <MemoryRouter initialEntries={['/signuptwo?username=user']}>
        <Routes>
          <Route path="/signuptwo" element={<SignupTwo />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('Fantasy'));
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/signuptwo');
    });
  });
});
