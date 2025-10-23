// Inisialisasi data transaksi dari localStorage atau array kosong
let transaksi = JSON.parse(localStorage.getItem('transaksi')) || [];
let filterAktif = 'semua';

// Format angka ke format Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// Hitung total saldo
function hitungSaldo() {
    const saldo = transaksi.reduce((total, item) => {
        return item.jenis === 'pemasukan' ? total + item.jumlah : total - item.jumlah;
    }, 0);
    
    document.getElementById('total-saldo').textContent = formatRupiah(saldo);
    
    // Ubah warna saldo berdasarkan nilai
    const saldoElement = document.getElementById('total-saldo');
    if (saldo < 0) {
        saldoElement.style.color = '#e74c3c';
    } else {
        saldoElement.style.color = '#2ecc71';
    }
}

// Simpan transaksi ke localStorage
function simpanKeLocalStorage() {
    localStorage.setItem('transaksi', JSON.stringify(transaksi));
}

// Tampilkan transaksi berdasarkan filter
function tampilkanTransaksi(filter = 'semua') {
    const daftarTransaksi = document.getElementById('daftar-transaksi');
    
    // Filter transaksi
    const transaksiTertampilkan = filter === 'semua' 
        ? transaksi 
        : transaksi.filter(item => item.jenis === filter);
    
    // Kosongkan daftar
    daftarTransaksi.innerHTML = '';
    
    // Tampilkan pesan jika tidak ada transaksi
    if (transaksiTertampilkan.length === 0) {
        daftarTransaksi.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>Tidak ada transaksi ${filter !== 'semua' ? filter : ''} untuk ditampilkan.</p>
            </div>
        `;
        return;
    }
    
    // Tampilkan setiap transaksi
    transaksiTertampilkan.forEach((item, index) => {
        const transaksiElement = document.createElement('div');
        transaksiElement.className = `transaksi-item ${item.jenis}`;
        transaksiElement.innerHTML = `
            <div class="transaksi-info">
                <div class="transaksi-jenis">${item.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</div>
                <div class="transaksi-keterangan">${item.keterangan}</div>
                <div class="transaksi-tanggal">${formatTanggal(item.tanggal)}</div>
            </div>
            <div class="transaksi-jumlah">${item.jenis === 'pemasukan' ? '+' : '-'} ${formatRupiah(item.jumlah)}</div>
            <div class="transaksi-actions">
                <button class="hapus-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        daftarTransaksi.appendChild(transaksiElement);
    });
    
    // Tambahkan event listener untuk tombol hapus
    document.querySelectorAll('.hapus-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            hapusTransaksi(id);
        });
    });
}

// Format tanggal dari YYYY-MM-DD ke DD/MM/YYYY
function formatTanggal(tanggalString) {
    const tanggal = new Date(tanggalString);
    return tanggal.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Hapus transaksi
function hapusTransaksi(id) {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        transaksi = transaksi.filter(item => item.id !== id);
        simpanKeLocalStorage();
        hitungSaldo();
        tampilkanTransaksi(filterAktif);
    }
}

// Tambah transaksi baru
function tambahTransaksi(jenis, jumlah, keterangan, tanggal) {
    const transaksiBaru = {
        id: Date.now().toString(),
        jenis,
        jumlah: parseInt(jumlah),
        keterangan,
        tanggal
    };
    
    transaksi.push(transaksiBaru);
    simpanKeLocalStorage();
    hitungSaldo();
    tampilkanTransaksi(filterAktif);
}

// Event listener untuk form transaksi
document.getElementById('form-transaksi').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const jenis = document.getElementById('jenis').value;
    const jumlah = document.getElementById('jumlah').value;
    const keterangan = document.getElementById('keterangan').value;
    const tanggal = document.getElementById('tanggal').value;
    
    // Validasi input
    if (!jenis || !jumlah || !keterangan || !tanggal) {
        alert('Harap lengkapi semua field!');
        return;
    }
    
    tambahTransaksi(jenis, jumlah, keterangan, tanggal);
    
    // Reset form
    this.reset();
    
    // Set tanggal default ke hari ini
    document.getElementById('tanggal').valueAsDate = new Date();
});

// Event listener untuk filter
document.getElementById('filter-semua').addEventListener('click', function() {
    filterAktif = 'semua';
    updateFilterButtons();
    tampilkanTransaksi('semua');
});

document.getElementById('filter-pemasukan').addEventListener('click', function() {
    filterAktif = 'pemasukan';
    updateFilterButtons();
    tampilkanTransaksi('pemasukan');
});

document.getElementById('filter-pengeluaran').addEventListener('click', function() {
    filterAktif = 'pengeluaran';
    updateFilterButtons();
    tampilkanTransaksi('pengeluaran');
});

// Update tampilan tombol filter
function updateFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`filter-${filterAktif}`).classList.add('active');
}

// Inisialisasi aplikasi saat pertama kali dimuat
function init() {
    // Set tanggal default ke hari ini
    document.getElementById('tanggal').valueAsDate = new Date();
    
    // Tampilkan transaksi dan hitung saldo
    hitungSaldo();
    tampilkanTransaksi();
}

// Jalankan inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', init);
