<template>
    <div>
        <el-tree :data="menus" :props="defaultProps" show-checkbox node-key="catId" default-expand-all
            :expand-on-click-node="false">
            <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
                <span>
                    <el-button type="text" size="mini" @click="() => append(data)">
                        添加
                    </el-button>
                    <el-button v-if="!data.children.length" type="text" size="mini" @click="() => remove(node, data)">
                        删除
                    </el-button>
                </span>
            </span>
        </el-tree>
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

        append(data) {
           
        },

        remove(node, data) {
            this.$http({
                url: this.$http.adornUrl('/product/category/delete','gateway'),
                method: 'post',
                data: this.$http.adornData(data, false)
            }).then(({ data }) => {
                if (data && data.code === 200) {
                    this.$message({
                        message: '操作成功',
                        type: 'success',
                        duration: 1500,
                        onClose: () => {
                            this.getMenus()
                        }
                    })
                } else {
                    this.$message.error(data.msg)
                }
            })
        },

        getMenus() {
            this.$http({
                url: this.$http.adornUrl('/product/category/list/tree', "gateway"),
                method: 'get',
            }).then(({ data }) => {
                this.menus = data.data
            })
        }
    }
}

</script>
<style lang='scss' scoped>
//@import url(); 引入公共 css 类</style>