var THREE = require('three');
import '../lib/TrackballControls'
import Detector from '../lib/Detector'
import dat from '../lib/dat.gui.min'
import '../lib/dat.gui.css'
import _ from 'lodash'
import { scaleLinear } from "d3-scale"

var nodeSizeScale = scaleLinear().domain([0, 20000]).range([5, 100])

var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,

    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,

    container,

    // level = 1,
    camControls,
    clock,

    raycaster,
    INTERSECTEDs,
    mouse,
    startSelect,

    wrapRounds,

    config,
    total,
    origin,

    camera, scene, renderer;


window.onload = function () {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    container = document.createElement('div');
    document.body.appendChild(container);

    // document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchstart, false);
    document.addEventListener('click', onDocumentClick, false);

    window.addEventListener('resize', onWindowResize, false);


    datInit();

    init(countJSON());
    animate();
}

function countJSON() {

    var jsons = []
    _.range(config['一层总数']).forEach((index) => {
        var item = {}
        if (!(index % config['一层节点']))
            item.links = _.map(_.range(config['二层总数']), index => {
                var item = {}
                if (!(index % config['二层节点'])) {
                    item.links = _.map(_.range(config['三层总数']), index => {
                        var item = {}
                        if (!(index % config['三层节点'])) {
                            item.links = _.map(_.range(config['四层总数']), index => ({}))
                        }
                        console.info(total++)
                        return item
                    })
                }
                console.info(total++)
                return item
            })
        console.info(total++)
        jsons.push(item)
    })

    return jsons
}

function countMutilPoints(particle, parentFans, parentPosition, level) {

    var rounds = config['离散度'] * (parentFans - 1)
    particle.position.copy(parentPosition)

    if (level == 1) {
        particle.position.x = Math.random() * 2 - 1;
        particle.position.y = Math.random() * 2 - 1;
        particle.position.z = Math.random() * 2 - 1;
    } else {
        particle.position.x += _.random(-rounds, rounds) / nodeSizeScale(total)
        particle.position.y += _.random(-rounds, rounds) / nodeSizeScale(total)
        particle.position.z += _.random(-rounds, rounds) / nodeSizeScale(total)
    }
}

function drawLevelPoints(particle, links = [], level = 1) {

    var parentFans = links.length;

    particle.inParticles = []
    particle.inLines = []
    wrapRounds[level - 1] = wrapRounds[level - 1] || []

    _.forEach(links, (item, index) => {

        var fans = item.links ? item.links.length : 0

        // 画第二圈的点
        var particle2 = new THREE.Sprite(new THREE.SpriteMaterial({
            color: config['微粒子颜色'],
            map: fans > 0 || config['无粉丝显示头像'] ? getTexture() : undefined
        }));

        countMutilPoints(particle2, parentFans, particle.position, level)

        particle2.position.normalize();

        particle2.prePosition = particle2.position.clone()
        particle2.preScale = particle2.scale.clone()

        particle2.position.multiplyScalar(config['层级间距'] * level)
        particle2.scale.multiplyScalar(fans * config['头像比例'] + 1);

        // 画线
        var geometry = new THREE.Geometry();
        geometry.vertices.push(particle2.position);
        geometry.vertices.push(particle.position);
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: config['线段颜色'], linewidth: 1, opacity: .1 }));
        line.position.normalize();

        line.connectParticles = [particle, particle2]

        line.material.visible = config['显示连接']

        // 保存点和线到所属的点中
        particle2.upParticle = particle
        particle.inParticles.push(particle2)
        particle.inLines.push(line)

        particle2.inLevel = level

        particle2.fixParentPosition = particle.position.clone()

        // 保存传播层级的圈数中的店
        wrapRounds[level - 1].push(particle2)

        scene.add(line);

        drawLevelPoints(particle2, item.links, level + 1)
    })

    scene.add(particle);
}

function drawLevelMesh() {
    _.forEach(wrapRounds, rounds => {
        var geometry = new THREE.Geometry();
        _.forEach(rounds, particle => {
            geometry.vertices.push(particle.position);
        })
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#fff', linewidth: 1, opacity: .1 }));
        scene.add(line)
    })
}

function getTexture() {
    var texture = new THREE.ImageUtils.loadTexture(
        `./imgs/${Math.round(Math.random() * 150 / 2)}.jpg`
    )
    return texture;
    // return undefined;
}

function datInit() {

    config = {
        微粒子颜色: '#fff',
        线段颜色: '#050546',
        旋转速度: 1.0,
        缩放速度: 1.0,
        水平移动度: 1.0,
        层级间距: 700,
        头像比例: 3,
        显示连接: true,
        自动转速: 2,
        离散度: 100,
        无粉丝显示头像: false,
        显示传播层级: -1,

        // 无粉丝显示头像时，粉丝为0的增加点粉丝数
        defFans: 5,

        一层总数: 100,
        一层节点: 20,
        二层总数: 50,
        二层节点: 10,
        三层总数: 100,
        三层节点: 30,
        四层总数: 20
    }
    var gui = new dat.GUI();


    var f3 = gui.addFolder('数据模拟');
    f3.add(config, '一层总数', 1, 100).onFinishChange(function (val) {
        init(countJSON())
    })
    f3.add(config, '一层节点', 1, 100).onFinishChange(function (val) {
        init(countJSON())
    })
    f3.add(config, '二层总数', 1, 100).onFinishChange(function (val) {
        init(countJSON())
    })
    f3.add(config, '二层节点', 1, 100).onFinishChange(function (val) {
        init(countJSON())
    })
    f3.add(config, '三层总数', 1, 100).onFinishChange(function (val) {
        init(countJSON())
    })
    f3.add(config, '三层节点', 1, 100).onFinishChange(function (val) {
        init(countJSON())
    })
    f3.add(config, '四层总数', 1, 100).onFinishChange(function (val) {
        init(countJSON())
    })


    var f1 = gui.addFolder('通用配置');
    f1.addColor(config, '微粒子颜色').onFinishChange(function (val) {
        _.forEach(scene.children, thing => {
            if (thing.type === 'Sprite') {
                if (thing.inParticles.length === 0) {
                    thing.material.color = new THREE.Color(val)
                }
            }
        })
    })
    f1.addColor(config, '线段颜色').onFinishChange(function (val) {
        _.forEach(scene.children, thing => {
            if (thing.type === 'Line') {
                thing.material.color = new THREE.Color(val)
            }
        })
    })
    f1.add(config, '层级间距', 100, 1000).onFinishChange(function (val) {
        _.forEach(scene.children, thing => {
            if (thing.type === 'Sprite' && thing.upParticle) {
                thing.position.copy(thing.prePosition).multiplyScalar(val * thing.inLevel);
            }
        })
        _.forEach(scene.children, thing => {

            if (thing.type === 'Line') {
                thing.geometry.vertices = [thing.connectParticles[0].position, thing.connectParticles[1].position]
                thing.geometry.verticesNeedUpdate = true
            }
        })
    })
    f1.add(config, '头像比例', 1, 10).onFinishChange(function (val) {
        _.forEach(scene.children, thing => {
            if (thing.type === 'Sprite' && thing.upParticle) {
                thing.scale.copy(thing.preScale).multiplyScalar((thing.inParticles.length === 0 ?
                    (config['无粉丝显示头像'] ? config.defFans : 0) : thing.inParticles.length) * val + 1);
            }
        })
    })
    f1.add(config, '显示连接').onFinishChange(function (val) {
        _.forEach(scene.children, thing => {
            if (thing.type === 'Line') {
                thing.visible = val
            }
        })
    })
    f1.add(config, '无粉丝显示头像').onFinishChange(function (val) {
        _.forEach(scene.children, thing => {
            if (thing.type === 'Sprite' && thing.upParticle) {
                if (thing.inParticles.length === 0) {
                    if (val) {
                        thing.material.map = getTexture()
                        _.forEach(scene.children, thing => {
                            if (thing.type === 'Sprite' && thing.upParticle) {
                                thing.scale.copy(thing.preScale).multiplyScalar((thing.inParticles.length === 0 ?
                                    (config['无粉丝显示头像'] ? config.defFans : 0) : thing.inParticles.length) * config['头像比例'] + 1);
                            }
                        })
                    } else {
                        thing.material.map = null
                        thing.scale.copy(thing.preScale)
                    }
                }

            }
        })
    })
    f1.add(config, '显示传播层级', { 全部: -1, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 }).onFinishChange(function (val) {
        _.forEach(scene.children, thing => {
            if (thing.type === 'Sprite' && thing.upParticle) {
                if (val == -1 || thing.inLevel == val) {
                    thing.material.visible = true
                } else {
                    thing.material.visible = false
                }
            }
        })
        _.forEach(scene.children, thing => {
            if (thing.type === 'Line') {
                if (thing.connectParticles[0].material.visible) {
                    thing.material.visible = true
                } else {
                    thing.material.visible = false
                }
            }
        })
    })

    // f1.add(config, '离散度', 50, 500).onFinishChange(function (val) {
    //     _.forEach(scene.children, thing => {
    //         if (thing.type === 'Sprite' && thing.inLevel != 1) {
    //             countMutilPoints(thing, thing.upParticle.inParticles.length, thing.fixParentPosition, thing.inLevel)
    //         }
    //     })
    //     _.forEach(scene.children, thing => {
    //         if (thing.type === 'Line') {
    //             thing.geometry.vertices = [thing.connectParticles[0].position, thing.connectParticles[1].position]
    //             thing.geometry.verticesNeedUpdate = true
    //         }
    //     })
    // })
    f1.add(config, '自动转速', 0, 5)


    var f2 = gui.addFolder('相机配置');
    f2.add(config, '旋转速度', .5, 2).onFinishChange(function (val) {
        camControls.rotateSpeed = val
    })
    f2.add(config, '缩放速度', .5, 2).onFinishChange(function (val) {
        camControls.zoomSpeed = val
    })
    f2.add(config, '水平移动度', .5, 2).onFinishChange(function (val) {
        camControls.panSpeed = val
    })


    f1.open()
    f2.open()
    f3.open()
}

function init(jsons) {
    total = 0
    INTERSECTEDs = []
    startSelect = false
    wrapRounds = []


    camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, .1, 10000);
    camera.position.z = 2300;

    camControls = new THREE.TrackballControls(camera)
    camControls.rotateSpeed = config['旋转速度']
    camControls.zoomSpeed = config['缩放速度']
    camControls.panSpeed = config['水平移动度']
    clock = new THREE.Clock()

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2()

    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0xffffff, 2000, 10000 );

    renderer && container.removeChild(renderer.domElement);
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container.appendChild(renderer.domElement);


    origin = new THREE.Sprite(new THREE.SpriteMaterial({
        color: '#ff0000',
    }))
    origin.scale.multiplyScalar(30)
    origin.position.normalize();
    drawLevelPoints(origin, jsons)


    // drawLevelMesh()




}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {
    event.preventDefault()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentTouchstart(event) {
    event.preventDefault()
    startSelect = true
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}

function onDocumentClick(event) {
    event.preventDefault()
    startSelect = true
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    var delta = clock.getDelta()
    camControls.update(delta)

    // find intersections
    if (startSelect) {
        startSelect = false
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children);
        // if (intersects.length > 0) {
        //     if (INTERSECTEDs != intersects[0].object) {

        //         if (intersects[0].object.type === 'Sprite') {
        //             if (INTERSECTEDs) selected(INTERSECTEDs, false)
        //             INTERSECTEDs = intersects[0].object;
        //             selected(INTERSECTEDs, true)
        //         }

        //     }
        // } else {
        //     if (INTERSECTEDs) {
        //         if (INTERSECTEDs.type === 'Sprite') {
        //             selected(INTERSECTEDs, false)
        //         }
        //     }
        //     INTERSECTEDs = null;
        // }

        if (intersects.length > 0) {

            if (intersects[0].object.type === 'Sprite') {

                var focus = intersects[0].object
                if (_.findIndex(INTERSECTEDs, intersects[0].object) !== -1) {
                    alert('remove:', focus)
                    _.remove(INTERSECTEDs, focus)
                } else {
                    alert('selected:', focus)
                    INTERSECTEDs.push(focus)
                }

            }

        }

    }

    camera.position.x += config['自动转速']


    renderer.render(scene, camera);

}