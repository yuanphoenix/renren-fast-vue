<template>
    <div>
        <el-tree :data="menus" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
    </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具 js，第三方插件 js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
    data() {
        return {
            menus: [],
            defaultProps: {
                children: 'children',
                label: 'name'
            }
        };
    },
    created() {
        this.getMenus();
    },
    methods: {
        handleNodeClick(data) {
            console.log(data);
        },

        getMenus() {
            this.$http({
                url: this.$http.adornUrl('/product/category/list/tree', "gateway"),
                method: 'get',
            }).then(({ data }) => {
                this.menus=data.data
            })
        }
    }
}

</script>
<style lang='scss' scoped>
//@import url(); 引入公共 css 类</style>