class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.weapons = [];
        this.currentWeapon = null;
        this.teammates = [];
        this.enemies = [];
        this.bullets = [];
        this.isGameRunning = false;
        this.selectedWeapon = 'pistol';
        this.teammateCount = 3;
        this.enemyCount = 3;
        this.playerHealth = 100;
        this.isPointerLocked = false;
        this.keysPressed = {};
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.7, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.createLights();
        this.createEnvironment();
        this.createWeapons();
        this.createPlayer();

        window.addEventListener('resize', () => this.onWindowResize());
        this.setupEventListeners();
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }

    createEnvironment() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3d5c3d,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b7355,
            roughness: 0.7
        });

        const walls = [
            { pos: [0, 5, -50], size: [100, 10, 1] },
            { pos: [0, 5, 50], size: [100, 10, 1] },
            { pos: [-50, 5, 0], size: [1, 10, 100] },
            { pos: [50, 5, 0], size: [1, 10, 100] }
        ];

        walls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(...wall.size);
            const mesh = new THREE.Mesh(geometry, wallMaterial);
            mesh.position.set(...wall.pos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });

        const obstacleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            roughness: 0.6
        });

        const obstacles = [
            { pos: [10, 1.5, -10], size: [3, 3, 3] },
            { pos: [-15, 1.5, 5], size: [4, 3, 2] },
            { pos: [20, 2, 15], size: [2, 4, 2] },
            { pos: [-25, 1.5, -15], size: [3, 3, 3] },
            { pos: [5, 1.5, 20], size: [2, 3, 4] },
            { pos: [-10, 2, -25], size: [4, 4, 2] }
        ];

        obstacles.forEach(obs => {
            const geometry = new THREE.BoxGeometry(...obs.size);
            const mesh = new THREE.Mesh(geometry, obstacleMaterial);
            mesh.position.set(...obs.pos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });
    }

    createWeapons() {
        this.weapons = {
            pistol: {
                name: '手枪',
                damage: 25,
                fireRate: 300,
                ammo: 12,
                maxAmmo: 12,
                reserveAmmo: 60,
                spread: 0.02,
                reloadTime: 1500,
                color: 0x888888
            },
            rifle: {
                name: '步枪',
                damage: 30,
                fireRate: 100,
                ammo: 30,
                maxAmmo: 30,
                reserveAmmo: 120,
                spread: 0.03,
                reloadTime: 2000,
                color: 0x555555
            },
            shotgun: {
                name: '霰弹枪',
                damage: 15,
                fireRate: 800,
                ammo: 8,
                maxAmmo: 8,
                reserveAmmo: 32,
                spread: 0.15,
                reloadTime: 2500,
                pellets: 8,
                color: 0x666666
            },
            sniper: {
                name: '狙击枪',
                damage: 100,
                fireRate: 1500,
                ammo: 5,
                maxAmmo: 5,
                reserveAmmo: 20,
                spread: 0.005,
                reloadTime: 3000,
                color: 0x444444
            }
        };
    }

    createPlayer() {
        const playerGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
        const playerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4169e1,
            roughness: 0.5
        });
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(0, 1, 0);
        this.player.castShadow = true;
        this.scene.add(this.player);

        this.player.velocity = new THREE.Vector3();
        this.player.speed = 8;
        this.player.jumpForce = 8;
        this.player.isJumping = false;
        this.player.canShoot = true;
        this.player.isReloading = false;
    }

    createTeammates(count) {
        this.teammates = [];
        const teamColor = 0x4169e1;

        for (let i = 0; i < count; i++) {
            const teammate = this.createCharacter(teamColor, 'teammate');
            const angle = (i / count) * Math.PI * 2;
            const radius = 5 + Math.random() * 5;
            teammate.position.set(
                Math.cos(angle) * radius,
                1,
                Math.sin(angle) * radius
            );
            teammate.health = 100;
            teammate.isAlive = true;
            teammate.target = null;
            teammate.lastShot = 0;
            this.teammates.push(teammate);
            this.scene.add(teammate);
        }
    }

    createEnemies(count) {
        this.enemies = [];
        const enemyColor = 0xff4444;

        for (let i = 0; i < count; i++) {
            const enemy = this.createCharacter(enemyColor, 'enemy');
            const angle = (i / count) * Math.PI * 2 + Math.PI;
            const radius = 20 + Math.random() * 10;
            enemy.position.set(
                Math.cos(angle) * radius,
                1,
                Math.sin(angle) * radius
            );
            enemy.health = 100;
            enemy.isAlive = true;
            enemy.target = null;
            enemy.lastShot = 0;
            this.enemies.push(enemy);
            this.scene.add(enemy);
        }
    }

    createCharacter(color, type) {
        const group = new THREE.Group();

        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        group.add(body);

        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.6;
        head.castShadow = true;
        group.add(head);

        const armGeometry = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-0.4, 0.9, 0);
        leftArm.rotation.z = 0.3;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(0.4, 0.9, 0);
        rightArm.rotation.z = -0.3;
        group.add(rightArm);

        group.type = type;
        return group;
    }

    setupEventListeners() {
        console.log('设置事件监听器...');
        
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());

        const startBtn = document.getElementById('startBtn');
        console.log('开始按钮:', startBtn);
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('开始游戏被点击');
                this.startGame();
            });
        }

        const restartBtn = document.getElementById('restartBtn');
        console.log('重新开始按钮:', restartBtn);
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }

        const weaponButtons = document.querySelectorAll('#weaponButtons .menu-btn');
        console.log('武器按钮数量:', weaponButtons.length);
        weaponButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('武器按钮被点击:', e.target.dataset.weapon);
                weaponButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedWeapon = e.target.dataset.weapon;
            });
        });

        const teammateButtons = document.querySelectorAll('#teammateButtons .menu-btn');
        console.log('队友按钮数量:', teammateButtons.length);
        teammateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('队友按钮被点击:', e.target.dataset.teammates);
                teammateButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.teammateCount = parseInt(e.target.dataset.teammates);
            });
        });

        const enemyButtons = document.querySelectorAll('#enemyButtons .menu-btn');
        console.log('敌人按钮数量:', enemyButtons.length);
        enemyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('敌人按钮被点击:', e.target.dataset.enemies);
                enemyButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.enemyCount = parseInt(e.target.dataset.enemies);
            });
        });
        
        console.log('事件监听器设置完成');
    }

    onKeyDown(e) {
        if (!this.isGameRunning) return;

        this.keysPressed[e.code] = true;

        switch(e.code) {
            case 'KeyW':
            case 'KeyA':
            case 'KeyS':
            case 'KeyD':
                this.player.moving = true;
                break;
            case 'Space':
                if (!this.player.isJumping) {
                    this.player.velocity.y = this.player.jumpForce;
                    this.player.isJumping = true;
                }
                break;
            case 'KeyR':
                this.reload();
                break;
            case 'Digit1':
                this.switchWeapon('pistol');
                break;
            case 'Digit2':
                this.switchWeapon('rifle');
                break;
            case 'Digit3':
                this.switchWeapon('shotgun');
                break;
            case 'Digit4':
                this.switchWeapon('sniper');
                break;
        }
    }

    onKeyUp(e) {
        if (!this.isGameRunning) return;

        this.keysPressed[e.code] = false;

        switch(e.code) {
            case 'KeyW':
            case 'KeyA':
            case 'KeyS':
            case 'KeyD':
                this.player.moving = false;
                break;
        }
    }

    onMouseMove(e) {
        if (!this.isGameRunning || !this.isPointerLocked) return;

        const sensitivity = 0.002;
        this.camera.rotation.y -= e.movementX * sensitivity;
        this.camera.rotation.x -= e.movementY * sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
    }

    onMouseDown(e) {
        if (!this.isGameRunning) return;

        if (e.button === 0) {
            if (!this.isPointerLocked) {
                document.body.requestPointerLock();
            } else {
                this.player.shooting = true;
            }
        }
    }

    onMouseUp(e) {
        if (!this.isGameRunning) return;

        if (e.button === 0) {
            this.player.shooting = false;
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.body;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    startGame() {
        document.getElementById('menu').style.display = 'none';
        this.isGameRunning = true;
        this.playerHealth = 100;
        this.currentWeapon = { ...this.weapons[this.selectedWeapon] };
        this.createTeammates(this.teammateCount);
        this.createEnemies(this.enemyCount);
        this.updateHUD();
        this.gameLoop();
    }

    restartGame() {
        document.getElementById('gameOver').style.display = 'none';
        
        this.teammates.forEach(t => this.scene.remove(t));
        this.enemies.forEach(e => this.scene.remove(e));
        this.bullets.forEach(b => this.scene.remove(b));
        
        this.teammates = [];
        this.enemies = [];
        this.bullets = [];
        
        this.player.position.set(0, 1, 0);
        this.player.velocity.set(0, 0, 0);
        this.playerHealth = 100;
        
        this.startGame();
    }

    switchWeapon(weaponName) {
        if (this.player.isReloading) return;
        this.currentWeapon = { ...this.weapons[weaponName] };
        this.updateHUD();
    }

    reload() {
        if (this.player.isReloading || this.currentWeapon.ammo === this.currentWeapon.maxAmmo) return;
        if (this.currentWeapon.reserveAmmo <= 0) return;

        this.player.isReloading = true;
        setTimeout(() => {
            const needed = this.currentWeapon.maxAmmo - this.currentWeapon.ammo;
            const available = Math.min(needed, this.currentWeapon.reserveAmmo);
            this.currentWeapon.ammo += available;
            this.currentWeapon.reserveAmmo -= available;
            this.player.isReloading = false;
            this.updateHUD();
        }, this.currentWeapon.reloadTime);
    }

    shoot() {
        if (!this.player.canShoot || this.player.isReloading || this.currentWeapon.ammo <= 0) return;

        this.player.canShoot = false;
        this.currentWeapon.ammo--;

        const pellets = this.currentWeapon.pellets || 1;
        
        for (let i = 0; i < pellets; i++) {
            const spread = this.currentWeapon.spread;
            const direction = new THREE.Vector3(0, 0, -1);
            direction.x += (Math.random() - 0.5) * spread;
            direction.y += (Math.random() - 0.5) * spread;
            direction.z += (Math.random() - 0.5) * spread;
            direction.normalize();
            direction.applyQuaternion(this.camera.quaternion);

            const bullet = this.createBullet(direction, this.currentWeapon.damage);
            this.bullets.push(bullet);
            this.scene.add(bullet);
        }

        setTimeout(() => {
            this.player.canShoot = true;
        }, this.currentWeapon.fireRate);

        this.updateHUD();
    }

    createBullet(direction, damage) {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(geometry, material);
        bullet.position.copy(this.camera.position);
        bullet.direction = direction;
        bullet.damage = damage;
        bullet.speed = 100;
        bullet.lifetime = 2;
        return bullet;
    }

    updateBullets(delta) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.add(bullet.direction.clone().multiplyScalar(bullet.speed * delta));
            bullet.lifetime -= delta;

            let hit = false;

            this.enemies.forEach(enemy => {
                if (!enemy.isAlive) return;
                const distance = bullet.position.distanceTo(enemy.position);
                if (distance < 1) {
                    enemy.health -= bullet.damage;
                    hit = true;
                    if (enemy.health <= 0) {
                        enemy.isAlive = false;
                        this.scene.remove(enemy);
                    }
                }
            });

            if (hit || bullet.lifetime <= 0) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }

    updatePlayer(delta) {
        const keys = {
            forward: this.keysPressed?.['KeyW'] || false,
            backward: this.keysPressed?.['KeyS'] || false,
            left: this.keysPressed?.['KeyA'] || false,
            right: this.keysPressed?.['KeyD'] || false
        };

        const direction = new THREE.Vector3();
        if (keys.forward) direction.z -= 1;
        if (keys.backward) direction.z += 1;
        if (keys.left) direction.x -= 1;
        if (keys.right) direction.x += 1;

        direction.normalize();
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);

        this.player.velocity.x = direction.x * this.player.speed;
        this.player.velocity.z = direction.z * this.player.speed;

        this.player.velocity.y -= 20 * delta;

        this.player.position.add(this.player.velocity.clone().multiplyScalar(delta));

        if (this.player.position.y < 1) {
            this.player.position.y = 1;
            this.player.velocity.y = 0;
            this.player.isJumping = false;
        }

        this.camera.position.copy(this.player.position);
        this.camera.position.y += 0.6;

        if (this.player.shooting) {
            this.shoot();
        }
    }

    updateTeammates(delta) {
        this.teammates.forEach(teammate => {
            if (!teammate.isAlive) return;

            let nearestEnemy = null;
            let nearestDistance = Infinity;

            this.enemies.forEach(enemy => {
                if (!enemy.isAlive) return;
                const distance = teammate.position.distanceTo(enemy.position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestEnemy = enemy;
                }
            });

            if (nearestEnemy) {
                const direction = new THREE.Vector3()
                    .subVectors(nearestEnemy.position, teammate.position)
                    .normalize();
                
                if (nearestDistance > 10) {
                    teammate.position.add(direction.clone().multiplyScalar(3 * delta));
                }

                const now = Date.now();
                if (now - teammate.lastShot > 500 && nearestDistance < 30) {
                    teammate.lastShot = now;
                    const bullet = this.createBullet(direction, 20);
                    bullet.position.copy(teammate.position);
                    bullet.position.y += 1.5;
                    this.bullets.push(bullet);
                    this.scene.add(bullet);
                }
            }
        });
    }

    updateEnemies(delta) {
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;

            let nearestTarget = null;
            let nearestDistance = Infinity;

            const targets = [this.player, ...this.teammates.filter(t => t.isAlive)];
            targets.forEach(target => {
                const distance = enemy.position.distanceTo(target.position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestTarget = target;
                }
            });

            if (nearestTarget) {
                const direction = new THREE.Vector3()
                    .subVectors(nearestTarget.position, enemy.position)
                    .normalize();
                
                if (nearestDistance > 15) {
                    enemy.position.add(direction.clone().multiplyScalar(2 * delta));
                }

                const now = Date.now();
                if (now - enemy.lastShot > 800 && nearestDistance < 35) {
                    enemy.lastShot = now;
                    const bullet = this.createBullet(direction, 15);
                    bullet.position.copy(enemy.position);
                    bullet.position.y += 1.5;
                    this.bullets.push(bullet);
                    this.scene.add(bullet);
                }

                if (nearestDistance < 2) {
                    this.playerHealth -= 10 * delta;
                }
            }
        });
    }

    checkGameOver() {
        const aliveTeammates = this.teammates.filter(t => t.isAlive).length;
        const aliveEnemies = this.enemies.filter(e => e.isAlive).length;

        if (this.playerHealth <= 0 && aliveTeammates === 0) {
            this.endGame(false);
        } else if (aliveEnemies === 0) {
            this.endGame(true);
        }
    }

    endGame(victory) {
        this.isGameRunning = false;
        document.exitPointerLock();

        const gameOverDiv = document.getElementById('gameOver');
        const gameOverText = document.getElementById('gameOverText');
        const gameOverStats = document.getElementById('gameOverStats');

        gameOverDiv.className = victory ? 'victory' : 'defeat';
        gameOverText.textContent = victory ? '游戏胜利!' : '游戏失败!';

        const aliveTeammates = this.teammates.filter(t => t.isAlive).length;
        const killedEnemies = this.enemyCount - this.enemies.filter(e => e.isAlive).length;
        gameOverStats.textContent = `剩余队友: ${aliveTeammates} | 击杀敌人: ${killedEnemies}`;

        gameOverDiv.style.display = 'flex';
    }

    updateHUD() {
        document.getElementById('weaponInfo').textContent = 
            `武器: ${this.currentWeapon.name} | 弹药: ${this.currentWeapon.ammo}/${this.currentWeapon.reserveAmmo}`;
        document.getElementById('healthInfo').textContent = 
            `生命: ${Math.max(0, Math.floor(this.playerHealth))}`;
        
        const aliveTeammates = this.teammates.filter(t => t.isAlive).length;
        const aliveEnemies = this.enemies.filter(e => e.isAlive).length;
        document.getElementById('teamInfo').textContent = 
            `队友: ${aliveTeammates} | 敌人: ${aliveEnemies}`;
    }

    gameLoop() {
        if (!this.isGameRunning) return;

        const delta = 0.016;

        this.updatePlayer(delta);
        this.updateTeammates(delta);
        this.updateEnemies(delta);
        this.updateBullets(delta);
        this.checkGameOver();
        this.updateHUD();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.gameLoop());
    }
}

let game = null;

window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    game.init();
});