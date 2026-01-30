
export class Game {
    constructor(gameData) {
        this.gameData = gameData;
        this.keywords = [];
        this.currentKeywordIndex = 0;
        this.score = 0;
        this.revealedLetters = {};
        this.starIndices = {};
        this.answeredQuestions = new Set();
        this.currentQuestion = null;
        this.modal = document.getElementById('modal');
        this.initWheel();
        this.initScoreboard();
        try {
            this.init();
        } catch (e) {
            console.error("Initialization failed:", e);
        }
    }

    initWheel() {
        const canvas = document.getElementById('wheelCanvas');
        if (!canvas) return;

        this.wheelSegments = [
            "+10", "+20", "+30",
            "CƯỚP 20 ĐIỂM",
            "-10", "-20",
            "CƯỚP 30 ĐIỂM",
            "-30",
            "TRÁO ĐIỂM",
            "+40",
            "MIỄN BỊ TRỪ",
            "+10", "+20",
            "TÔI CÓ KHIÊN",
            "+30",
            "+10", "+20",
            "QUAY THÊM 2 LƯỢT",
            "MẤT LƯỢT",
            "-10", "+30"
        ];

        this.colors = ['#e63946', '#f1c40f', '#10b981', '#1a1a2e', '#457b9d', '#ff9f1c'];
        this.currentRotation = 0;
        this.isSpinning = false;

        this.drawWheel();
        document.getElementById('spinBtn').onclick = () => this.spinWheel();
    }

    drawWheel() {
        const canvas = document.getElementById('wheelCanvas');
        const ctx = canvas.getContext('2d');
        const radius = canvas.width / 2;
        const arcSize = (2 * Math.PI) / this.wheelSegments.length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.wheelSegments.forEach((segment, i) => {
            const angle = i * arcSize;

            // Draw segment
            ctx.beginPath();
            ctx.fillStyle = this.colors[i % this.colors.length];
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius, angle, angle + arcSize);
            ctx.lineTo(radius, radius);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 18px Poppins";
            ctx.fillText(segment, radius - 20, 10);
            ctx.restore();
        });

        // Center circle
        ctx.beginPath();
        ctx.arc(radius, radius, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ffd700';
        ctx.stroke();
    }

    spinWheel() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        const spinBtn = document.getElementById('spinBtn');
        const wheelResult = document.getElementById('wheelResult');
        const canvas = document.getElementById('wheelCanvas');

        spinBtn.disabled = true;
        wheelResult.textContent = '🎡 Đang quay...';

        const extraRotation = 360 * 5; // 5 full circles
        const randomRotation = Math.floor(Math.random() * 360);
        this.currentRotation += extraRotation + randomRotation;

        canvas.style.transform = `rotate(${this.currentRotation}deg)`;

        setTimeout(() => {
            this.isSpinning = false;
            spinBtn.disabled = false;

            // Calculate landing segment
            const actualRotation = this.currentRotation % 360;
            const segmentAngle = 360 / this.wheelSegments.length;

            // Canvas rotates clockwise, but pointer is at top (offset by 270 deg)
            const landingIndex = Math.floor(((360 - actualRotation + 270) % 360) / segmentAngle);
            const result = this.wheelSegments[landingIndex];

            wheelResult.textContent = `🎯 Kết quả: ${result}`;

            // Show result popup
            const modalResult = document.getElementById('wheelModalResult');
            if (modalResult) {
                modalResult.textContent = result;
            }
            document.getElementById('wheelModal').classList.add('active');

            // Handle special segments
            if (result === "TRÁO ĐIỂM") {
                setTimeout(() => {
                    const idx = prompt("Nhập số thứ tự nhóm vừa quay (1-6):");
                    if (idx) {
                        this.promptSwap(parseInt(idx) - 1);
                    }
                }, 1000);
            }

            this.saveGame();
        }, 5000); // 5 seconds rotation
    }

    initScoreboard() {
        const teamNames = ["NHÓM 1", "NHÓM 2", "NHÓM 4", "NHÓM 5", "NHÓM 6", "NHÓM 7"];
        this.teams = JSON.parse(localStorage.getItem('teamScores')) ||
            teamNames.map(name => ({ name, score: 0 }));
        this.renderScoreboard();
    }

    renderScoreboard() {
        const container = document.getElementById('teamScoreboard');
        if (!container) return;

        // Create a copy with original indices to maintain correct button actions
        const sortedTeams = this.teams
            .map((team, index) => ({ ...team, originalIndex: index }))
            .sort((a, b) => b.score - a.score);

        const maxScore = sortedTeams.length > 0 ? sortedTeams[0].score : 0;

        container.innerHTML = '';
        sortedTeams.forEach((team, i) => {
            const hasScore = team.score > 0;
            const isTop1 = i === 0 && hasScore;
            const isTop2 = i === 1 && hasScore;
            const isTop3 = i === 2 && hasScore;

            const card = document.createElement('div');
            card.className = `team-card ${isTop1 ? 'top-team' : ''} ${isTop2 ? 'rank2-team' : ''} ${isTop3 ? 'rank3-team' : ''}`;
            card.draggable = true;
            card.dataset.index = team.originalIndex;

            let badgeHtml = '';
            if (isTop1) badgeHtml = '<span class="top-badge">👑 TOP 1</span>';
            else if (isTop2) badgeHtml = '<span class="top-badge bg-silver">🥈 TOP 2</span>';
            else if (isTop3) badgeHtml = '<span class="top-badge bg-bronze">🥉 TOP 3</span>';

            card.innerHTML = `
                <div class="team-header pointer-events-none">
                    <div class="flex items-center gap-2">
                        <span class="rank-badge">${i + 1}</span>
                        ${badgeHtml}
                        <span class="team-name">${team.name}</span>
                    </div>
                    <span class="team-score" id="score-${team.originalIndex}">${team.score}</span>
                </div>
                <div class="score-controls">
                    <button class="score-btn btn-minus" onclick="event.stopPropagation(); game.updateTeamScore(${team.originalIndex}, -10)">-10</button>
                    <button class="score-btn btn-plus" onclick="event.stopPropagation(); game.updateTeamScore(${team.originalIndex}, 10)">+10</button>
                </div>
            `;

            // Drag events
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', team.originalIndex);
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                document.querySelectorAll('.team-card').forEach(c => c.classList.remove('drag-over'));
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                card.classList.add('drag-over');
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const targetIndex = team.originalIndex;

                if (sourceIndex !== targetIndex) {
                    this.swapScores(sourceIndex, targetIndex);
                }
            });

            container.appendChild(card);
        });

        // Update central Top 3 panel
        for (let i = 1; i <= 3; i++) {
            const team = sortedTeams[i - 1];
            if (team) {
                const scoreEl = document.getElementById(`top${i}-score`);
                const nameEl = document.getElementById(`top${i}-name`);
                if (scoreEl) scoreEl.textContent = team.score;
                if (nameEl) nameEl.textContent = team.name;
            }
        }
    }

    promptSwap(index1) {
        const options = this.teams
            .map((t, i) => i !== index1 ? `${i + 1}: ${t.name} (${t.score}đ)` : null)
            .filter(Boolean)
            .join('\n');

        const choice = prompt(`Chọn số thứ tự nhóm muốn tráo điểm với ${this.teams[index1].name}:\n${options}`);

        if (choice) {
            const index2 = parseInt(choice) - 1;
            if (index2 >= 0 && index2 < this.teams.length && index2 !== index1) {
                this.swapScores(index1, index2);
            } else {
                alert('Lựa chọn không hợp lệ!');
            }
        }
    }

    swapScores(index1, index2) {
        const team1 = this.teams[index1];
        const team2 = this.teams[index2];

        const tempScore = team1.score;
        team1.score = team2.score;
        team2.score = tempScore;

        localStorage.setItem('teamScores', JSON.stringify(this.teams));
        this.renderScoreboard();

        // Notification animation
        const wheelResult = document.getElementById('wheelResult');
        if (wheelResult) {
            wheelResult.style.color = '#f1c40f';
            wheelResult.textContent = `🔄 Đã tráo điểm: ${team1.name} ↔ ${team2.name}`;
        }
    }

    updateTeamScore(index, delta) {
        this.teams[index].score += delta;
        localStorage.setItem('teamScores', JSON.stringify(this.teams));
        this.renderScoreboard(); // Re-render to update Top 1 status

        // Add a small animation to the score
        const scoreEl = document.getElementById(`score-${index}`);
        if (scoreEl) {
            scoreEl.classList.remove('animate-bounce-short');
            void scoreEl.offsetWidth; // trigger reflow
            scoreEl.classList.add('animate-bounce-short');
        }
    }

    init() {
        this.loadGame();
        this.renderKeywords();
        this.setupEventListeners();
        this.updateStats();
    }

    loadGame() {
        if (!this.gameData || !this.gameData.data) {
            console.error("❌ Game data not loaded", this.gameData);
            this.keywords = [];
            return;
        }

        this.keywords = this.gameData.data;

        // Initialize revealed letters and star indices for each keyword
        this.keywords.forEach((keyword, idx) => {
            if (!this.revealedLetters[idx]) {
                this.revealedLetters[idx] = new Array(keyword.keyword.length).fill(false);
            }
            if (this.starIndices[idx] === undefined) {
                // Randomly pick a tile to have a star
                this.starIndices[idx] = Math.floor(Math.random() * keyword.keyword.length);
            }
        });

        // Load from localStorage
        const saved = localStorage.getItem('gameState');
        if (saved) {
            const state = JSON.parse(saved);
            this.score = state.score || 0;
            this.revealedLetters = state.revealedLetters || this.revealedLetters;
            this.starIndices = state.starIndices || this.starIndices;
            this.answeredQuestions = new Set(state.answeredQuestions || []);
        }
    }

    saveGame() {
        const state = {
            score: this.score,
            revealedLetters: this.revealedLetters,
            starIndices: this.starIndices,
            answeredQuestions: Array.from(this.answeredQuestions)
        };
        localStorage.setItem('gameState', JSON.stringify(state));
    }

    setupEventListeners() {
        document.getElementById('guideBtn').addEventListener('click', () => {
            document.getElementById('guideModal').classList.add('active');
        });
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('clearSaveBtn').addEventListener('click', () => this.clearSave());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    renderKeywords() {
        const grid = document.getElementById('gameGrid');
        grid.innerHTML = '';

        this.keywords.forEach((keyword, keywordIdx) => {
            const card = document.createElement('div');
            const isSolved = localStorage.getItem(`solved-${keywordIdx}`) === 'true';
            card.className = `keyword-card glass-panel p-6 ${isSolved ? 'solved' : ''}`;

            const header = document.createElement('div');
            header.className = 'flex justify-between items-center mb-4';

            const title = document.createElement('div');
            title.className = 'keyword-title';
            title.textContent = `Câu số ${keywordIdx + 1}`;
            header.appendChild(title);

            const solveBtn = document.createElement('button');
            solveBtn.className = 'solve-btn';
            solveBtn.innerHTML = isSolved ? '✅ Đã giải' : '✨ Giải mã';
            solveBtn.onclick = () => this.solveKeyword(keywordIdx);
            header.appendChild(solveBtn);

            card.appendChild(header);

            if (isSolved && keyword.answer) {
                const answerDisplay = document.createElement('div');
                answerDisplay.className = 'answer-display animate-bounce-short';
                answerDisplay.innerHTML = `<span class="label">ĐÁP ÁN:</span> <span class="value">${keyword.answer}</span>`;
                card.appendChild(answerDisplay);
            }

            const tilesGrid = document.createElement('div');
            tilesGrid.className = 'tiles-grid';

            keyword.keyword.split('').forEach((letter, letterIdx) => {
                const tile = document.createElement('div');
                tile.className = 'tile';

                const isRevealed = this.revealedLetters[keywordIdx][letterIdx];

                if (isRevealed || isSolved) {
                    tile.classList.add('revealed');
                    if (this.starIndices[keywordIdx] === letterIdx) {
                        tile.classList.add('star-tile');
                        tile.innerHTML = `<span>${letter}</span><span class="star-icon">⭐</span>`;
                    } else {
                        tile.textContent = letter;
                    }
                } else {
                    tile.classList.add('locked');
                    tile.textContent = '?';
                    tile.addEventListener('click', () => {
                        this.openQuestion(keywordIdx, letterIdx);
                    });
                }

                tilesGrid.appendChild(tile);
            });

            card.appendChild(tilesGrid);
            grid.appendChild(card);
        });
    }

    solveKeyword(keywordIdx) {
        const keyword = this.keywords[keywordIdx];
        const answer = keyword.answer || "Chưa có đáp án";
        localStorage.setItem(`solved-${keywordIdx}`, 'true');
        // Also reveal all letters of the scrambled keyword
        this.revealedLetters[keywordIdx] = new Array(keyword.keyword.length).fill(true);
        this.saveGame();
        this.renderKeywords();
        this.updateStats();

    }

    openQuestion(keywordIdx, letterIdx) {
        const keyword = this.keywords[keywordIdx];
        const letter = keyword.keyword[letterIdx];

        // Check for Lucky Star
        if (this.starIndices[keywordIdx] === letterIdx) {
            const wheelResult = document.getElementById('wheelResult');
            if (wheelResult) {
                wheelResult.style.color = '#ffd700';
                wheelResult.textContent = `🌟 CHÚC MỪNG! Bạn đã tìm thấy Ô CHỮ MAY MẮN!`;

                // Add bonus score?
                this.score += 20;
                this.updateStats();
            }
        }

        // Get unanswered questions for this keyword
        const unansweredQuestions = keyword.questions.filter((_, idx) => {
            const questionId = `${keywordIdx}-${idx}`;
            return !this.answeredQuestions.has(questionId);
        });

        if (unansweredQuestions.length === 0) {
            alert('Bạn đã trả lời hết câu hỏi cho từ khóa này!');
            return;
        }

        // Pick a random unanswered question
        const question = unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
        const questionIdx = keyword.questions.indexOf(question);

        this.currentQuestion = {
            keywordIdx,
            letterIdx,
            questionIdx,
            letter
        };

        this.showQuestion(keywordIdx, questionIdx, letter);
    }

    showQuestion(keywordIdx, questionIdx, letter) {
        const keyword = this.keywords[keywordIdx];
        const question = keyword.questions[questionIdx];
        const modalContent = this.modal.querySelector('.modal-content');
        const modalTitle = document.getElementById('modalTitle');
        const isStar = this.starIndices[keywordIdx] === this.currentQuestion.letterIdx;

        document.getElementById('questionText').textContent = question.q;

        if (isStar) {
            modalTitle.innerHTML = '🌟 CÂU HỎI MAY MẮN ⭐';
            modalContent.classList.add('star-modal');
        } else {
            modalTitle.textContent = 'Câu hỏi';
            modalContent.classList.remove('star-modal');
        }

        const answerCount = keyword.questions.filter((_, idx) => {
            const qId = `${keywordIdx}-${idx}`;
            return this.answeredQuestions.has(qId);
        }).length;

        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';

        // Shuffle options
        const shuffled = [...question.options].sort(() => Math.random() - 0.5);

        shuffled.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.checkAnswer(option, question.a, keywordIdx, questionIdx));
            container.appendChild(btn);
        });

        document.getElementById('feedback').classList.remove('show', 'success', 'error');
        document.getElementById('feedback').textContent = '';

        this.modal.classList.add('active');
    }

    checkAnswer(selected, correct, keywordIdx, questionIdx) {
        const feedback = document.getElementById('feedback');
        const options = document.querySelectorAll('.option-btn');

        options.forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
        });

        const isCorrect = selected === correct;

        if (isCorrect) {
            this.score += 10;
            feedback.textContent = '🎉 Chính xác! Bạn mở được một ô chữ!';
            feedback.className = 'feedback show success';
            feedback.style.display = 'block';

            // Mark question as answered
            const questionId = `${keywordIdx}-${questionIdx}`;
            this.answeredQuestions.add(questionId);

            // Reveal one letter
            const letterIdx = this.currentQuestion.letterIdx;
            this.revealedLetters[keywordIdx][letterIdx] = true;

            setTimeout(() => {
                this.closeModal();
                this.renderKeywords();
                this.updateStats();
                this.saveGame();
            }, 1500);
        } else {
            feedback.textContent = '❌ Sai rồi!';
            feedback.className = 'feedback show error';
            feedback.style.display = 'block';

            options.forEach(btn => {
                if (btn.textContent === selected) {
                    btn.classList.add('incorrect');
                }
            });

            setTimeout(() => {
                options.forEach(btn => {
                    btn.disabled = false;
                    btn.style.pointerEvents = 'auto';
                    btn.classList.remove('incorrect');
                });
                feedback.classList.remove('show');
                feedback.style.display = 'none';
            }, 2000);
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.currentQuestion = null;
    }

    updateStats() {
        const totalRevealedLetters = Object.values(this.revealedLetters)
            .flat()
            .filter(Boolean).length;

        const totalLetters = this.keywords.reduce((sum, kw) => sum + kw.keyword.length, 0);

        const completedKeywords = this.keywords.filter((_, idx) => {
            return this.revealedLetters[idx].every(r => r);
        }).length;

        // Old stat elements were removed for the Top 3 panel
        // If they ever come back, add check: document.getElementById('score')?.textContent = ...

        if (totalLetters > 0) {
            const progressPercent = (totalRevealedLetters / totalLetters) * 100;
            const progressBar = document.getElementById('progressBar');
            if (progressBar) progressBar.style.width = `${progressPercent}%`;
        }
    }

    unlockAll() {
        this.keywords.forEach((keyword, idx) => {
            this.revealedLetters[idx] = new Array(keyword.keyword.length).fill(true);
            localStorage.setItem(`solved-${idx}`, 'true');
        });
        this.saveGame();
        this.renderKeywords();
        this.updateStats();
    }

    reset() {
        if (confirm('Bạn chắc chắn muốn chơi lại từ đầu?')) {
            this.score = 0;
            this.answeredQuestions.clear();
            this.keywords.forEach((_, idx) => {
                this.revealedLetters[idx] = new Array(this.keywords[idx].keyword.length).fill(false);
                localStorage.removeItem(`solved-${idx}`);
            });
            this.saveGame();
            this.renderKeywords();
            this.updateStats();
            this.closeModal();
        }
    }

    clearSave() {
        if (confirm('Bạn chắc chắn muốn xóa dữ liệu lưu trữ?')) {
            localStorage.removeItem('gameState');
            localStorage.removeItem('teamScores');
            for (let i = 0; i < 6; i++) localStorage.removeItem(`solved-${i}`);
            location.reload();
        }
    }
}